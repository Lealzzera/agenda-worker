import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import makeListClinicSettingsServiceFactory from "./factories/make-list-clinic-settings-service.factory";
import makeUpdateClinicSettingsServiceFactory from "./factories/make-update-clinic-settings-service.factory";

export async function listClinicSettingsController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const { clinicId } = req.params as { clinicId: string };

  const listClinicSettingsService = makeListClinicSettingsServiceFactory();
  const clinicSettings = await listClinicSettingsService.exec({ clinicId });

  return res.status(200).send(clinicSettings);
}

export async function updateClinicSettingsController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const updateClinicSettingsBodySchema = z.object({
    chargesEvaluation: z.boolean(),
    evaluationPriceCents: z.number(),
    maxAppointmentsPerSlot: z.number(),
    appointmentDurationMinutes: z.number(),
    allowRescheduling: z.boolean(),
    allowCancellation: z.boolean(),
    aiAgentName: z.string(),
    clinicName: z.string().optional(),
    address: z.string().nullable().optional(),
    postalCode: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    clinicType: z
      .enum(["DENTAL", "AESTHETIC", "MEDICAL", "OTHER", "PSYCHOLOGY"])
      .optional(),
  });

  const { clinicId } = req.params as { clinicId: string };

  const {
    chargesEvaluation,
    evaluationPriceCents,
    maxAppointmentsPerSlot,
    appointmentDurationMinutes,
    allowRescheduling,
    allowCancellation,
    aiAgentName,
    clinicName,
    address,
    postalCode,
    city,
    state,
    clinicType,
  } = updateClinicSettingsBodySchema.parse(req.body);

  const updateClinicSettingsService = makeUpdateClinicSettingsServiceFactory();
  const clinicSettings = await updateClinicSettingsService.exec({
    clinicId,
    aiAgentName,
    allowCancellation,
    allowRescheduling,
    appointmentDurationMinutes,
    chargesEvaluation,
    evaluationPriceCents,
    maxAppointmentsPerSlot,
    clinicName,
    address,
    postalCode,
    clinicType,
    city,
    state,
  });

  return res.status(200).send(clinicSettings);
}
