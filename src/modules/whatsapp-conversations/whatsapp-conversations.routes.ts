import { verifyJwt } from "@/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import {
  createWhatsappConversationController,
  findWhatsappConversationController,
  updateWhatsappConversationController,
} from "./whatsapp-conversations.controller";

export async function whatsappConversationsRoutes(app: FastifyInstance) {
  app.post(
    "/create",
    {
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
      preHandler: [verifyJwt],
    },
    async (req, res) => await createWhatsappConversationController(req, res),
  );

  app.get(
    "/:clinicId/:chatId",
    {
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
      preHandler: [verifyJwt],
    },
    async (req, res) => await findWhatsappConversationController(req, res),
  );

  app.patch(
    "/:clinicId/:chatId",
    {
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
      preHandler: [verifyJwt],
    },
    async (req, res) => await updateWhatsappConversationController(req, res),
  );
}
