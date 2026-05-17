import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateAppointmentServiceFactory } from "./factories/make-create-appointment-service.factory";
import { makeDeleteAppointmentServiceFactory } from "./factories/make-delete-appointment-service.factory";
import { makeListAppointmentsServiceFactory } from "./factories/make-list-appointments-service.factory";
import { makeUpdateAppointmentServiceFactory } from "./factories/make-update-appointment-service.factory";

const appointmentStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "CANCELED",
  "COMPLETED",
]);

const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/;

export async function createAppointmentController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const createAppointmentBodySchema = z.object({
    clinicId: z.uuid(),
    customerPhoneNumber: z.string().min(11),
    customerName: z.string().min(1, {
      message: "Customer name is required.",
    }),
    appointmentDate: z.string().regex(dateOnlyRegex, {
      message: "Invalid day format. Expected YYYY-MM-DD.",
    }),
    time: z.string().regex(timeRegex, {
      message: "Invalid time format. Expected HH:MM or HH:MM:SS.",
    }),
    notes: z.string().max(1000).optional(),
    status: appointmentStatusSchema.optional(),
  });

  const {
    clinicId,
    customerPhoneNumber,
    customerName,
    appointmentDate,
    time,
    notes,
    status,
  } = createAppointmentBodySchema.parse(req.body);

  const createAppointmentService = makeCreateAppointmentServiceFactory();
  const { appointment } = await createAppointmentService.exec({
    clinicId,
    customerPhoneNumber,
    customerName,
    appointmentDate,
    time,
    notes,
    status,
  });

  return res.status(201).send({ appointment });
}

export async function listAppointmentsController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const listAppointmentsParamsSchema = z.object({
    clinicId: z.uuid(),
  });

  const listAppointmentsQuerySchema = z.object({
    status: appointmentStatusSchema.optional(),
    startDate: z
      .string()
      .regex(dateOnlyRegex, {
        message: "Invalid startDate format. Expected YYYY-MM-DD.",
      })
      .optional(),
    endDate: z
      .string()
      .regex(dateOnlyRegex, {
        message: "Invalid endDate format. Expected YYYY-MM-DD.",
      })
      .optional(),
  });

  const { clinicId } = listAppointmentsParamsSchema.parse(req.params);
  const { status, startDate, endDate } = listAppointmentsQuerySchema.parse(
    req.query,
  );

  const listAppointmentsService = makeListAppointmentsServiceFactory();
  const { appointments } = await listAppointmentsService.exec({
    clinicId,
    status,
    startDate,
    endDate,
  });

  return res.status(200).send({ appointments });
}

export async function updateAppointmentController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const updateAppointmentParamsSchema = z.object({
    appointmentId: z.uuid(),
  });

  const updateAppointmentBodySchema = z.object({
    customerName: z.string().min(1).optional(),
    customerPhoneNumber: z.string().min(11).optional(),
    appointmentDate: z
      .string()
      .regex(dateOnlyRegex, {
        message: "Invalid day format. Expected YYYY-MM-DD.",
      })
      .optional(),
    time: z
      .string()
      .regex(timeRegex, {
        message: "Invalid time format. Expected HH:MM or HH:MM:SS.",
      })
      .optional(),
    notes: z.string().max(1000).nullable().optional(),
    status: appointmentStatusSchema.optional(),
  });

  const { appointmentId } = updateAppointmentParamsSchema.parse(req.params);
  const updatePayload = updateAppointmentBodySchema.parse(req.body);

  const updateAppointmentService = makeUpdateAppointmentServiceFactory();
  const { appointment } = await updateAppointmentService.exec({
    appointmentId,
    ...updatePayload,
  });

  return res.status(200).send({ appointment });
}

export async function deleteAppointmentController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const deleteAppointmentParamsSchema = z.object({
    appointmentId: z.uuid(),
  });

  const { appointmentId } = deleteAppointmentParamsSchema.parse(req.params);

  const deleteAppointmentService = makeDeleteAppointmentServiceFactory();
  await deleteAppointmentService.exec({ appointmentId });

  return res.status(204).send();
}
