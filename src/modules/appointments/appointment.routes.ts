import { requireActiveSubscription } from "@/middlewares/require-active-subscription";
import { verifyJwt } from "@/middlewares/verify-jwt";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  createAppointmentController,
  deleteAppointmentController,
  listAppointmentsController,
  updateAppointmentController,
} from "./appointment.controller";

export async function appointmentRoutes(app: FastifyInstance) {
  app.register(async function (protectedRoutes) {
    protectedRoutes.addHook("preHandler", verifyJwt);
    protectedRoutes.addHook("preHandler", requireActiveSubscription);

    protectedRoutes.post(
      "/",
      { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
      async (req: FastifyRequest, res: FastifyReply) =>
        await createAppointmentController(req, res),
    );

    protectedRoutes.get(
      "/list/:clinicId",
      { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
      async (req: FastifyRequest, res: FastifyReply) =>
        await listAppointmentsController(req, res),
    );

    protectedRoutes.patch(
      "/:appointmentId",
      { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
      async (req: FastifyRequest, res: FastifyReply) =>
        await updateAppointmentController(req, res),
    );

    protectedRoutes.delete(
      "/:appointmentId",
      { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
      async (req: FastifyRequest, res: FastifyReply) =>
        await deleteAppointmentController(req, res),
    );
  });
}
