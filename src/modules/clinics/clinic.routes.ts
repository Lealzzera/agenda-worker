import { FastifyInstance } from "fastify";
import { registerClinicController } from "./clinic.controller";
import { getMyClinicController } from "./get-my-clinic.controller";
import { verifyJwt } from "@/middlewares/verify-jwt";

export async function clinicRoutes(app: FastifyInstance) {
  app.post(
    "/register",
    { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } },
    async (req, res) => await registerClinicController(req, res)
  );

  app.get(
    "/me",
    { preHandler: [verifyJwt] },
    async (req, res) => await getMyClinicController(req, res)
  );
}
