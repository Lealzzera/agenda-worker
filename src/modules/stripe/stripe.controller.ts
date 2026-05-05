import { prisma } from "@/db/prisma";
import { env } from "@/env";
import { NotFoundError } from "@/errors/not-found.error";
import { SignupDraftRepository } from "@/modules/signup-draft/repositories/signup-draft-repository";
import { FastifyReply, FastifyRequest } from "fastify";
import Stripe from "stripe";
import z from "zod";

export async function createStripeCheckoutSessionController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const bodySchema = z.object({
    priceId: z.string(),
    uiMode: z.enum(["embedded_page"]),
    quantity: z.number(),
    mode: z.enum(["subscription", "payment"]),
    draftId: z.string().uuid(),
  });

  const { priceId, uiMode, quantity, mode, draftId } = bodySchema.parse(req.body);

  const draftRepository = new SignupDraftRepository();
  const draft = await draftRepository.findById(prisma, draftId);

  if (!draft || draft.status !== "PENDING") {
    throw new NotFoundError("Signup draft not found or already completed.");
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const session = await stripe.checkout.sessions.create({
    subscription_data: {
      trial_period_days: 7,
      metadata: { draftId },
    },
    client_reference_id: draftId,
    metadata: { draftId },
    customer_email: draft.email,
    ui_mode: uiMode,
    currency: "brl",
    line_items: [{ price: priceId, quantity }],
    mode,
    return_url: `${env.FRONTEND_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
  });

  // Vincula o stripe_checkout_session_id ao draft para o webhook encontrar depois
  await draftRepository.linkStripeSession(prisma, draftId, session.id);

  return res.send({
    clientSecret: session.client_secret,
    session,
  });
}
