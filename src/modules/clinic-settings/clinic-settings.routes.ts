import { verifyJwt } from "@/middlewares/verify-jwt";
import { verifyAdmin } from "@/middlewares/verify-admin";
import { FastifyInstance } from "fastify";
import {
  listClinicAiPromptController,
  listClinicSettingsController,
  updateClinicAiPromptController,
  updateClinicSettingsController,
} from "./clinic-settings.controller";

export async function clinicSettingsRoutes(app: FastifyInstance) {
  app.get(
    "/ai-prompt",
    {
      preHandler: [verifyJwt, verifyAdmin],
      config: { rateLimit: { max: 100, timeWindow: "1 minute" } },
    },
    async (req, res) => await listClinicAiPromptController(req, res),
  );

  app.post(
    "/ai-prompt",
    {
      preHandler: [verifyJwt, verifyAdmin],
      config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
    },
    async (req, res) => await updateClinicAiPromptController(req, res),
  );

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
