import { env } from "@/env";
import { FastifyReply, FastifyRequest } from "fastify";
import Stripe from "stripe";
import makeUpdateSubscriptionService from "../subscription/factories/make-update-subscription-service.factory";
import makeRegisterUserClinicAccountServiceFactory from "./factories/make-register-user-clinic-account-service.factory";

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  req: FastifyRequest,
) {
  const draftId = session.client_reference_id;
  if (!draftId) {
    req.log.warn(
      { sessionId: session.id },
      "checkout.session without draftId — ignoring",
    );
    return;
  }

  const registerUserClinicAccountService =
    makeRegisterUserClinicAccountServiceFactory();

  const { user } = await registerUserClinicAccountService.exec({
    draftId,
    stripeCheckoutSessionId: session.id,
    stripeCustomerId: session.customer as string,
    stripeSubscriptionId: session.subscription as string,
    lastStripeInvoiceId: session.invoice as string,
  });

  return user;
}

async function handlePaymentSucceeded(session: Stripe.Event.Data) {
  const dataSession = session.object as Stripe.Invoice;
  if (
    !dataSession.parent?.subscription_details?.subscription ||
    typeof dataSession.parent?.subscription_details?.subscription !== "string"
  ) {
    throw new Error("Invalid subscription id");
  }
  if (dataSession.billing_reason === "subscription_cycle") {
    const updateSubscriptionService = makeUpdateSubscriptionService();
    await updateSubscriptionService.exec({
      clinicStatus: "ACTIVE",
      subscriptionStatus: "ACTIVE",
      currentPeriodStart: dataSession.period_start,
      currentPeriodEnd: dataSession.period_end,
      lastStripeInvoiceId: dataSession.id,
      stripeSubscriptionId:
        dataSession.parent?.subscription_details?.subscription,
    });
  }
}

async function handlePaymentFailed(session: Stripe.Event.Data) {
  const dataSession = session.object as Stripe.Invoice;
  if (
    !dataSession.parent?.subscription_details?.subscription ||
    typeof dataSession.parent?.subscription_details?.subscription !== "string"
  ) {
    throw new Error("Invalid subscription id");
  }
  if (dataSession.billing_reason === "subscription_cycle") {
    const updateSubscriptionService = makeUpdateSubscriptionService();
    await updateSubscriptionService.exec({
      clinicStatus: "SUSPENDED",
      subscriptionStatus: "PAST_DUE",
      lastStripeInvoiceId: dataSession.id,
      stripeSubscriptionId:
        dataSession.parent?.subscription_details?.subscription,
    });
  }
}

async function handleSubscriptionDeleted(session: Stripe.Event.Data) {
  const dataSession = session.object as Stripe.Invoice;
  if (
    !dataSession.parent?.subscription_details?.subscription ||
    typeof dataSession.parent?.subscription_details?.subscription !== "string"
  ) {
    throw new Error("Invalid subscription id");
  }
  if (dataSession.billing_reason === "subscription_cycle") {
    const updateSubscriptionService = makeUpdateSubscriptionService();
    await updateSubscriptionService.exec({
      clinicStatus: "SUSPENDED",
      subscriptionStatus: "CANCELED",
      lastStripeInvoiceId: dataSession.id,
      stripeSubscriptionId:
        dataSession.parent?.subscription_details?.subscription,
    });
  }
}

export async function stripeWebhookController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const signature = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    req.log.error(err, "Stripe webhook signature verification failed");
    return res.status(400).send({ message: "Invalid webhook signature" });
  }
  res.status(200).send({ received: true });
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object, req);
        break;
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data);
        break;
      case "customer.subscription.deleted":
        handleSubscriptionDeleted(event.data);
        break;
      case "customer.subscription.updated":
        //TODO: IMPLEMENT A METHOD TO UPDATE THE CUSTOMER PLAN
        console.log("Customer subscription updated", event.data.object);
        break;
      default:
        req.log.info({ type: event.type }, "Unhandled Stripe event");
    }
  } catch (err) {
    req.log.error(err, `Error processing Stripe event: ${event.type}`);
  }
}
