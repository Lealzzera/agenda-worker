import { FastifyInstance } from "fastify";
import { stripeWebhookController } from "./stripe-webhook.controller";
import {
  completeStripeCheckoutSessionController,
  createStripeCheckoutSessionController,
} from "./stripe.controller";

export async function stripeRoutes(app: FastifyInstance) {
  app.post("/create-checkout-session", async (req, res) => {
    return createStripeCheckoutSessionController(req, res);
  });
  app.post("/complete-checkout-session", async (req, res) => {
    return completeStripeCheckoutSessionController(req, res);
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
