import { FastifyInstance } from "fastify";
import { createStripeCheckoutSessionController } from "./stripe.controller";
import { stripeWebhookController } from "./stripe-webhook.controller";

export async function stripeRoutes(app: FastifyInstance) {
  app.post("/create-checkout-session", async (req, res) => {
    return createStripeCheckoutSessionController(req, res);
  });

  // Plugin aninhado isolado: o content type parser de Buffer só vale para o webhook.
  // Se fosse no mesmo escopo, quebraria o parse JSON das outras rotas.
  app.register(async (webhookScope) => {
    webhookScope.addContentTypeParser(
      "application/json",
      { parseAs: "buffer" },
      (_req, body, done) => done(null, body)
    );

    webhookScope.post("/webhook", async (req, res) => {
      return stripeWebhookController(req, res);
    });
  });
}
