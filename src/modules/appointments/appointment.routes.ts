import { verifyJwt } from "@/middlewares/verify-jwt";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createAppointmentController } from "./appointment.controller";

export async function appointmentRoutes(app: FastifyInstance) {
  app.register(async function (protectedRoutes) {
    protectedRoutes.addHook("preHandler", verifyJwt);
    protectedRoutes.post(
      "/",
      { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
      async (req: FastifyRequest, res: FastifyReply) =>
        await createAppointmentController(req, res),
    );
  });
}
