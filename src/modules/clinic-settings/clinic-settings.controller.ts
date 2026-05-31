import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import makeListClinicSettingsServiceFactory from "./factories/make-list-clinic-settings-service.factory";
import makeUpdateClinicSettingsServiceFactory from "./factories/make-update-clinic-settings-service.factory";

const clinicTypeSchema = z.enum([
  "DENTAL",
  "MEDICAL",
  "AESTHETIC",
  "PSYCHOLOGY",
  "OTHER",
]);

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
    additionalInformation: z.string().nullable().optional(),
    clinicName: z.string().optional(),
    clinicType: clinicTypeSchema.optional(),
    address: z.string().nullable().optional(),
    postalCode: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
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
    additionalInformation,
    clinicName,
    clinicType,
    address,
    postalCode,
    city,
    state,
  } = updateClinicSettingsBodySchema.parse(req.body);

  const updateClinicSettingsService = makeUpdateClinicSettingsServiceFactory();
  const clinicSettings = await updateClinicSettingsService.exec({
    clinicId,
    aiAgentName,
    allowCancellation,
    allowRescheduling,
    appointmentDurationMinutes,
    additionalInformation,
    chargesEvaluation,
    evaluationPriceCents,
    maxAppointmentsPerSlot,
    clinicName,
    clinicType,
    address,
    postalCode,
    city,
    state,
  });

  return res.status(200).send(clinicSettings);
}
