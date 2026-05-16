import { FastifyInstance } from "fastify";
import { stripeWebhookController } from "./stripe-webhook.controller";
import { createStripeCheckoutSessionController } from "./stripe.controller";

export async function stripeRoutes(app: FastifyInstance) {
  app.post("/create-checkout-session", async (req, res) => {
    return createStripeCheckoutSessionController(req, res);
  });
  app.register(async (webhookScope) => {
    webhookScope.addContentTypeParser(
      "application/json",
      { parseAs: "buffer" },
      (_req, body, done) => done(null, body),
    );
    webhookScope.post("/webhook", async (req, res) => {
      return stripeWebhookController(req, res);
    });
  });
}
