import { env } from "@/env";
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
  });

  const { priceId, uiMode, quantity, mode } = bodySchema.parse(req.body);
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    ui_mode: uiMode,
    currency: "brl",
    line_items: [
      {
        price: priceId,
        quantity: quantity,
      },
    ],
    mode: mode,
    return_url: `${env.FRONTEND_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
  });
  return res.send({
    clientSecret: session.client_secret,
  });
}
