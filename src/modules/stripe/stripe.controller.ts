import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import makeCreateStripeSessionService from "./factories/make-create-stripe-session-service.factory";

export async function createStripeCheckoutSessionController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const bodySchema = z.object({
    priceId: z.string(),
    uiMode: z.enum(["embedded_page"]),
    quantity: z.number(),
    mode: z.enum(["subscription", "payment"]),
    draftId: z.uuid(),
  });

  const { priceId, uiMode, quantity, mode, draftId } = bodySchema.parse(
    req.body,
  );

  const createSessionStripeService = makeCreateStripeSessionService();
  const stripeSession = await createSessionStripeService.exec({
    priceId,
    uiMode,
    quantity,
    mode,
    draftId,
  });

  return res.send({
    clientSecret: stripeSession.client_secret,
    session: stripeSession,
  });
}
