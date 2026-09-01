import { prisma } from "@/db/prisma";
import { env } from "@/env";
import { syncSubscriptionFromStripe } from "@/modules/subscription/stripe-subscription-sync.service";
import { FastifyReply, FastifyRequest } from "fastify";
import Stripe from "stripe";
import makeRegisterUserClinicAccountServiceFactory from "./factories/make-register-user-clinic-account-service.factory";

function getObjectId(value: string | { id: string } | null) {
  return typeof value === "string" ? value : value?.id;
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  const subscription = invoice.parent?.subscription_details?.subscription;
  return typeof subscription === "string" ? subscription : subscription?.id;
}

async function retrieveAndSyncSubscription(
  stripe: Stripe,
  stripeSubscriptionId: string,
) {
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  return syncSubscriptionFromStripe(subscription);
}

async function handleCheckoutSessionCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  req: FastifyRequest,
) {
  const draftId = session.client_reference_id;
  const stripeSubscriptionId = getObjectId(session.subscription);

  if (!draftId || !stripeSubscriptionId) {
    req.log.warn(
      { sessionId: session.id },
      "Checkout session without draft or subscription id",
    );
    return;
  }

  const existingSubscription = await prisma.subscription.findUnique({
    where: { stripe_subscription_id: stripeSubscriptionId },
  });

  if (!existingSubscription) {
    const registerUserClinicAccountService =
      makeRegisterUserClinicAccountServiceFactory();

    await registerUserClinicAccountService.exec({
      draftId,
      stripeCheckoutSessionId: session.id,
      stripeCustomerId: getObjectId(session.customer) ?? "",
      stripeSubscriptionId,
      lastStripeInvoiceId: getObjectId(session.invoice),
    });
  }

  await retrieveAndSyncSubscription(stripe, stripeSubscriptionId);
}

async function handleInvoiceChanged(stripe: Stripe, invoice: Stripe.Invoice) {
  const stripeSubscriptionId = getInvoiceSubscriptionId(invoice);
  if (!stripeSubscriptionId) return;

  await retrieveAndSyncSubscription(stripe, stripeSubscriptionId);
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
  } catch (error) {
    req.log.error(error, "Stripe webhook signature verification failed");
    return res.status(400).send({ message: "Invalid webhook signature" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(stripe, event.data.object, req);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
        await syncSubscriptionFromStripe(event.data.object);
        break;
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
      case "invoice.payment_action_required":
        await handleInvoiceChanged(stripe, event.data.object);
        break;
      default:
        req.log.info({ type: event.type }, "Unhandled Stripe event");
    }

    return res.status(200).send({ received: true });
  } catch (error) {
    req.log.error(error, `Error processing Stripe event: ${event.type}`);
    return res.status(500).send({ message: "Stripe webhook processing failed" });
  }
}
