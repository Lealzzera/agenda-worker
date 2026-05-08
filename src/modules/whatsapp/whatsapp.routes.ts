import { verifyJwt } from "@/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { disconnectController } from "./disconnect.controller";
import { postQrCodeController } from "./qrCode.controller";

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
}
