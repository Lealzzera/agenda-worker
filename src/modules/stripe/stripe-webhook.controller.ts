import { prisma } from "@/db/prisma";
import { env } from "@/env";
import { makeCreateRegisterClinicServiceFactory } from "@/modules/clinics/factories/make-create-register-clinic-service.factory";
import { RegistrationDraftRepository } from "@/modules/registration-draft/repositories/registration-draft-repository";
import { ISaveRegistrationDraftRequest } from "@/modules/registration-draft/use-cases/save-registration-draft.service";
import { FastifyReply, FastifyRequest } from "fastify";
import Stripe from "stripe";

export async function stripeWebhookController(req: FastifyRequest, res: FastifyReply) {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const signature = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    // req.body chega como Buffer porque o plugin de webhook tem seu próprio
    // content type parser — obrigatório para verificar a assinatura do Stripe
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    req.log.error(err, "Stripe webhook signature verification failed");
    return res.status(400).send({ message: "Invalid webhook signature" });
  }

  // Responde 200 imediatamente para o Stripe não reenviar o evento
  res.status(200).send({ received: true });

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutSessionCompleted(event.data.object, req);
    }
    // Adicione outros eventos conforme necessário:
    // invoice.paid          → mudar status para ACTIVE + atualizar current_period
    // invoice.payment_failed → mudar status para PAST_DUE
    // customer.subscription.deleted → mudar status para CANCELED
  } catch (err) {
    req.log.error(err, `Error processing Stripe event: ${event.type}`);
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  req: FastifyRequest
) {
  const draftId = session.client_reference_id;

  if (!draftId) {
    req.log.warn({ sessionId: session.id }, "checkout.session.completed sem draftId — ignorando");
    return;
  }

  const draftRepository = new RegistrationDraftRepository();
  const draft = await draftRepository.findByStripeSessionId(prisma, session.id);

  if (!draft) {
    req.log.warn({ sessionId: session.id, draftId }, "Draft não encontrado para a sessão — ignorando");
    return;
  }

  if (draft.status === "COMPLETED") {
    req.log.info({ draftId }, "Draft já completado — ignorando (idempotência)");
    return;
  }

  const payload = draft.payload as ISaveRegistrationDraftRequest;

  const registerClinicService = makeCreateRegisterClinicServiceFactory();
  const { userId, clinicId } = await registerClinicService.exec(payload);

  await draftRepository.complete(prisma, draft.id, { userId, clinicId });

  req.log.info({ draftId, userId, clinicId }, "Registro completado via webhook");
}
