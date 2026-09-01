import { requireActiveSubscription } from "@/middlewares/require-active-subscription";
import { verifyJwt } from "@/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { chatOverviewController } from "./chat-overview.controller";
import { disconnectController } from "./disconnect.controller";
import { getChatMessagesController } from "./get-chat-messages.controller";
import { postQrCodeController } from "./qrCode.controller";
import { sendMessageController } from "./send-message.controller";
import { wahaWebhookController } from "./waha-webhook.controller";

const paidRoutePreHandlers = [verifyJwt, requireActiveSubscription];

export async function whatsappRoutes(app: FastifyInstance) {
  app.post("/qr-code", { preHandler: paidRoutePreHandlers }, async (req, res) =>
    postQrCodeController(req, res),
  );
  app.delete(
    "/disconnect/:sessionName",
    { preHandler: paidRoutePreHandlers },
    async (req, res) => disconnectController(req, res),
  );
  app.post(
    "/send-message",
    { preHandler: paidRoutePreHandlers },
    async (req, res) => sendMessageController(req, res),
  );
  app.post(
    "/chats/:sessionName/overview",
    { preHandler: paidRoutePreHandlers },
    async (req, res) => chatOverviewController(req, res),
  );
  app.get(
    "/chats/:sessionName/:chatId/messages",
    { preHandler: paidRoutePreHandlers },
    async (req, res) => getChatMessagesController(req, res),
  );
  app.register(async (webhookScope) => {
    webhookScope.addContentTypeParser(
      "application/json",
      { parseAs: "buffer" },
      (_req, body, done) => done(null, body),
    );

    webhookScope.post("/webhook", async (req, res) =>
      wahaWebhookController(req, res),
    );
  });
}
