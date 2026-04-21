import { FastifyInstance } from "fastify";
import { createStripeCheckoutSessionController } from "./stripe.controller";

export async function stripeRoutes(app: FastifyInstance) {
  app.post("/create-checkout-session", async (req, res) => {
    return createStripeCheckoutSessionController(req, res);
  });
}
