import { verifyJwt } from "@/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import {
  listClinicSettingsController,
  updateClinicSettingsController,
} from "./clinic-settings.controller";

export async function clinicSettingsRoutes(app: FastifyInstance) {
  app.get(
    "/:clinicId",
    {
      preHandler: [verifyJwt],
      config: { rateLimit: { max: 100, timeWindow: "1 minute" } },
    },
    async (req, res) => await listClinicSettingsController(req, res),
  );

  app.post(
    "/:clinicId",
    {
      preHandler: [verifyJwt],
      config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
    },
    async (req, res) => await updateClinicSettingsController(req, res),
  );
}
