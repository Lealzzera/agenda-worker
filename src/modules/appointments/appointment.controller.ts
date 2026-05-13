import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateAppointmentServiceFactory } from "./factories/make-create-appointment-service.factory";

export async function createAppointmentController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const createAppointmentBodySchema = z.object({
    clinicId: z.uuid(),
    serviceId: z.uuid().optional(),
    customerPhoneNumber: z.string().min(8),
    day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Invalid day format. Expected YYYY-MM-DD.",
    }),
    time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, {
      message: "Invalid time format. Expected HH:MM or HH:MM:SS.",
    }),
    notes: z.string().max(1000).optional(),
    status: z
      .enum(["PENDING", "CONFIRMED", "CANCELED", "COMPLETED"])
      .optional(),
  });

  const { clinicId, serviceId, customerPhoneNumber, day, time, notes, status } =
    createAppointmentBodySchema.parse(req.body);

  const createAppointmentService = makeCreateAppointmentServiceFactory();
  const { appointment } = await createAppointmentService.exec({
    clinicId,
    serviceId,
    customerPhoneNumber,
    day,
    time,
    notes,
    status,
  });

  return res.status(201).send({ appointment });
}
