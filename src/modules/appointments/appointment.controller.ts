import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateAppointmentServiceFactory } from "./factories/make-create-appointment-service.factory";

export async function createAppointmentController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const createAppointmentBodySchema = z.object({
    clinicId: z.uuid(),
    customerPhoneNumber: z.string().min(11),
    appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
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

  const {
    clinicId,
    customerPhoneNumber,
    appointmentDate,
    time,
    notes,
    status,
  } = createAppointmentBodySchema.parse(req.body);

  const createAppointmentService = makeCreateAppointmentServiceFactory();
  const { appointment } = await createAppointmentService.exec({
    clinicId,
    customerPhoneNumber,
    appointmentDate,
    time,
    notes,
    status,
  });

  return res.status(201).send({ appointment });
}
