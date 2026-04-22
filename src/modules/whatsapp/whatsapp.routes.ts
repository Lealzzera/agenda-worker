import { verifyJwt } from "@/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import {
  disconnectClinicSessionController,
  getClinicQrController,
  getClinicStatusController,
  startClinicSessionController,
  stopClinicSessionController,
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

    protectedRoutes.post("/clinics/:clinicId/session", async (req, res) =>
      startClinicSessionController(req, res),
    );

    protectedRoutes.post("/clinics/:clinicId/session/stop", async (req, res) =>
      stopClinicSessionController(req, res),
    );

    protectedRoutes.delete("/clinics/:clinicId/session", async (req, res) =>
      disconnectClinicSessionController(req, res),
    );

    protectedRoutes.get("/clinics/:clinicId/status", async (req, res) =>
      getClinicStatusController(req, res),
    );

    protectedRoutes.get("/clinics/:clinicId/qr", async (req, res) =>
      getClinicQrController(req, res),
    );
  });
}
