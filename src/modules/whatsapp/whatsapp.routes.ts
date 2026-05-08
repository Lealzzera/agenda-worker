import { verifyJwt } from "@/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import {
  disconnectClinicSessionController,
  getClinicQrController,
  getClinicStatusController,
  wahaWebhookController,
} from "./whatsapp.controller";

export async function whatsappRoutes(app: FastifyInstance) {
  app.post(
    "/webhook",
    {
      config: {
        rateLimit: { max: 100, timeWindow: "1 minute" },
      },
    },
    async (req, res) => wahaWebhookController(req, res),
  );

  app.register(async function (protectedRoutes) {
    protectedRoutes.addHook("preHandler", verifyJwt);

    protectedRoutes.get("/clinics/:clinicId/qr", async (req, res) =>
      getClinicQrController(req, res),
    );

    protectedRoutes.get("/clinics/:clinicId/status", async (req, res) =>
      getClinicStatusController(req, res),
    );

    protectedRoutes.delete("/clinics/:clinicId/session", async (req, res) =>
      disconnectClinicSessionController(req, res),
    );
  });
}
