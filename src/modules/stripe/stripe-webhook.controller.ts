import { prisma } from "@/db/prisma";
import { env } from "@/env";
import { makeCreateRegisterClinicServiceFactory } from "@/modules/clinics/factories/make-create-register-clinic-service.factory";
import { SignupDraftRepository } from "@/modules/signup-draft/repositories/signup-draft-repository";
import { RegisterSignupDraftServiceRequest } from "@/modules/signup-draft/register-signup-draft.service";
import { FastifyReply, FastifyRequest } from "fastify";
import Stripe from "stripe";

export async function stripeWebhookController(req: FastifyRequest, res: FastifyReply) {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const signature = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    req.log.error(err, "Stripe webhook signature verification failed");
    return res.status(400).send({ message: "Invalid webhook signature" });
  }

  // Responde 200 imediatamente para o Stripe não reenviar
  res.status(200).send({ received: true });

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object, req);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object, req);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object, req);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, req);
        break;
      default:
        req.log.info({ type: event.type }, "Unhandled Stripe event");
    }
  } catch (err) {
    req.log.error(err, `Error processing Stripe event: ${event.type}`);
  }
}

// ─── checkout.session.completed ──────────────────────────────────────────────
// Cria o usuário + clínica + subscription a partir do draft

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  req: FastifyRequest
) {
  const draftId = session.client_reference_id;
  if (!draftId) {
    req.log.warn({ sessionId: session.id }, "checkout.session.completed sem draftId — ignorando");
    return;
  }

  const draftRepository = new SignupDraftRepository();
  // Usa o draftId do client_reference_id — mais confiável que buscar pela sessionId,
  // que pode ser sobrescrita se o frontend criar múltiplas sessões
  const draft = await draftRepository.findById(prisma, draftId);

  if (!draft) {
    req.log.warn({ draftId, sessionId: session.id }, "Draft não encontrado — ignorando");
    return;
  }

  if (draft.status === "COMPLETED") {
    req.log.info({ draftId }, "Draft já completado — idempotência");
    return;
  }

  const payload = draft.data as unknown as RegisterSignupDraftServiceRequest["data"] & {
    userFullName?: string;
    password?: string;
  };

  const registerClinicService = makeCreateRegisterClinicServiceFactory();
  const { userId, clinicId } = await registerClinicService.exec({
    userFullName: draft.full_name,
    userEmail: draft.email,
    passwordHash: draft.password_hash, // usa o hash já salvo no draft
    clinicName: payload.clinicName,
    clinicType: payload.clinicType as any,
    address: payload.address,
    postalCode: payload.postalCode,
    city: payload.city,
    state: payload.state,
    planId: draft.selected_plan_id,
    workingHours: payload.workingHours as any,
    services: payload.services,
    settings: payload.settings,
  });

  // Vincula stripe_subscription_id e stripe_customer_id na subscription recém-criada
  const stripeSubscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  if (stripeSubscriptionId || stripeCustomerId) {
    await prisma.subscription.updateMany({
      where: { clinic_id: clinicId },
      data: {
        ...(stripeSubscriptionId && { stripe_subscription_id: stripeSubscriptionId }),
        ...(stripeCustomerId && { stripe_customer_id: stripeCustomerId }),
        stripe_checkout_session_id: session.id,
      },
    });
  }

  await prisma.signupDraft.update({
    where: { id: draft.id },
    data: { status: "COMPLETED" },
  });

  req.log.info({ draftId, userId, clinicId }, "Registro completado via webhook");
}

// ─── invoice.paid ─────────────────────────────────────────────────────────────
// Trial acabou e o pagamento foi confirmado → status ACTIVE, atualiza período

async function handleInvoicePaid(invoice: Stripe.Invoice, req: FastifyRequest) {
  // Ignora o invoice inicial de R$0 criado junto com a subscription (trial)
  // billing_reason === 'subscription_create' = invoice gerado na criação, sem cobrança real
  if (invoice.billing_reason === "subscription_create") {
    req.log.info("invoice.paid ignorado — subscription_create (trial invoice)");
    return;
  }

  const stripeSubscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;

  if (!stripeSubscriptionId) return;

  const subscription = await prisma.subscription.findUnique({
    where: { stripe_subscription_id: stripeSubscriptionId },
  });

  if (!subscription) {
    req.log.warn({ stripeSubscriptionId }, "Subscription não encontrada para invoice.paid");
    return;
  }

  const periodStart = invoice.period_start ? new Date(invoice.period_start * 1000) : new Date();
  const periodEnd = invoice.period_end ? new Date(invoice.period_end * 1000) : new Date();

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: "ACTIVE",
      current_period_start: periodStart,
      current_period_end: periodEnd,
    },
  });

  req.log.info({ subscriptionId: subscription.id }, "Subscription ativada via invoice.paid");
}

// ─── invoice.payment_failed ───────────────────────────────────────────────────
// Pagamento falhou → PAST_DUE

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, req: FastifyRequest) {
  const stripeSubscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;

  if (!stripeSubscriptionId) return;

  const subscription = await prisma.subscription.findUnique({
    where: { stripe_subscription_id: stripeSubscriptionId },
  });

  if (!subscription) return;

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "PAST_DUE" },
  });

  req.log.info({ subscriptionId: subscription.id }, "Subscription PAST_DUE via payment_failed");
}

// ─── customer.subscription.deleted ───────────────────────────────────────────
// Assinatura cancelada → CANCELED

async function handleSubscriptionDeleted(
  stripeSubscription: Stripe.Subscription,
  req: FastifyRequest
) {
  const subscription = await prisma.subscription.findUnique({
    where: { stripe_subscription_id: stripeSubscription.id },
  });

  if (!subscription) return;

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "CANCELED" },
  });

  req.log.info({ subscriptionId: subscription.id }, "Subscription CANCELED");
}
