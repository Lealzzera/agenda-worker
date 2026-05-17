import { verifyJwt } from "@/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { createSpecialDateController } from "./clinic-special-date.controller";

export async function clinicSpecialDateRoutes(app: FastifyInstance) {
  app.post(
    "/create",
    {
      preHandler: [verifyJwt],
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    },
    async (req, res) => await createSpecialDateController(req, res),
  );
}
