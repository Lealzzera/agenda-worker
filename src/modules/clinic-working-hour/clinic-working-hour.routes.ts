import { verifyJwt } from "@/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import {
  listAllWorkingHoursController,
  updateWorkingHoursController,
} from "./clinic-working-hour.controller";

export async function clinicWorkingHourRoutes(app: FastifyInstance) {
  app.get(
    "/:clinicId",
    {
      preHandler: [verifyJwt],
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
    },
    async (req, res) => await listAllWorkingHoursController(req, res),
  );

  app.put(
    "/:clinicId",
    {
      preHandler: [verifyJwt],
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    },
    async (req, res) => await updateWorkingHoursController(req, res),
  );
}
