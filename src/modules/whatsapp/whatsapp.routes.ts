import { verifyJwt } from "@/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { postQrCodeController } from "./qrCode.controller";

export async function whatsappRoutes(app: FastifyInstance) {
  app.post("/qr-code", { preHandler: [verifyJwt] }, async (req, res) => {
    return postQrCodeController(req, res);
  });
}
