import { verifyJwt } from "@/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { chatOverviewController } from "./chat-overview.controller";
import { disconnectController } from "./disconnect.controller";
import { getChatMessagesController } from "./get-chat-messages.controller";
import { postQrCodeController } from "./qrCode.controller";
import { sendMessageController } from "./send-message.controller";

export async function whatsappRoutes(app: FastifyInstance) {
  app.post("/qr-code", { preHandler: [verifyJwt] }, async (req, res) => {
    return postQrCodeController(req, res);
  });
  app.delete(
    "/disconnect/:sessionName",
    { preHandler: [verifyJwt] },
    async (req, res) => {
      return disconnectController(req, res);
    },
  );
  app.post("/send-message", { preHandler: [verifyJwt] }, async (req, res) => {
    return sendMessageController(req, res);
  });
  app.post(
    "/chats/:sessionName/overview",
    { preHandler: [verifyJwt] },
    async (req, res) => {
      return chatOverviewController(req, res);
    },
  );
  app.get(
    "/chats/:sessionName/:chatId/messages",
    { preHandler: [verifyJwt] },
    async (req, res) => {
      return getChatMessagesController(req, res);
    },
  );
}
