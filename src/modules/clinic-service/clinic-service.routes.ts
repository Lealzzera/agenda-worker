import { verifyJwt } from "@/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import {
  listClinicServicesController,
  updateClinicServicesController,
} from "./clinic-service.controller";

export async function clinicServiceRoutes(app: FastifyInstance) {
  app.get(
    "/:clinicId",
    {
      preHandler: [verifyJwt],
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
    },
    async (req, res) => await listClinicServicesController(req, res),
  );

  app.put(
    "/:clinicId",
    {
      preHandler: [verifyJwt],
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    },
    async (req, res) => await updateClinicServicesController(req, res),
  );
}
