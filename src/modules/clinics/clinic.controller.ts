import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeCreateRegisterClinicServiceFactory } from "./factories/make-create-register-clinic-service.factory";

const workingHourSchema = z.object({
  weekday: z.enum([
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ]),
  startTime: z.string(),
  endTime: z.string(),
});

const serviceSchema = z.object({
  name: z.string(),
  durationMinutes: z.coerce.number().int().positive(),
  priceCents: z.coerce.number().int().nonnegative().optional(),
});

const settingsSchema = z.object({
  chargesEvaluation: z.boolean().optional(),
  evaluationPriceCents: z.coerce.number().int().nonnegative().optional(),
  maxAppointmentsPerSlot: z.coerce.number().int().positive().optional(),
  appointmentDurationMinutes: z.coerce.number().int().positive().optional(),
  allowRescheduling: z.boolean().optional(),
  allowCancellation: z.boolean().optional(),
  timezone: z.string().optional(),
  aiAgentName: z.string().optional(),
});

export async function registerClinicController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const registerClinicSchema = z.object({
    userFullName: z.string(),
    userEmail: z.email(),
    password: z.string().min(8),

    userPictureUrl: z
      .url()
      .optional()
      .or(z.literal(""))
      .transform((val) => (val === "" ? undefined : val)),
    clinicName: z.string(),
    clinicType: z
      .enum(["DENTAL", "MEDICAL", "AESTHETIC", "PSYCHOLOGY", "OTHER"])
      .optional(),
    cnpj: z.string().optional(),
    phone: z.string().optional(),
    clinicEmail: z
      .email()
      .optional()
      .or(z.literal(""))
      .transform((val) => (val === "" ? undefined : val)),

    address: z.string().optional(),
    postalCode: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    planId: z.string(),
    workingHours: z.array(workingHourSchema).optional(),
    services: z.array(serviceSchema).optional(),
    settings: settingsSchema.optional(),
  });

  const data = registerClinicSchema.parse(req.body);

  const {
    userFullName,
    userEmail,
    password,
    clinicName,
    planId,
    clinicType,
    workingHours,
    services,
    settings,
  } = data;

  const userPictureUrl = data.userPictureUrl || undefined;
  const cnpj = data.cnpj || undefined;
  const phone = data.phone || undefined;
  const clinicEmail = data.clinicEmail || undefined;
  const address = data.address || undefined;
  const postalCode = data.postalCode || undefined;
  const city = data.city || undefined;
  const state = data.state || undefined;

  const registerClinicService = makeCreateRegisterClinicServiceFactory();
  await registerClinicService.exec({
    userFullName,
    userEmail,
    password,
    userPictureUrl,
    clinicName,
    clinicType,
    cnpj,
    phone,
    clinicEmail,
    address,
    postalCode,
    city,
    state,
    planId,
    workingHours,
    services,
    settings,
  });

  return res.status(201).send({ message: "Clinic created successfully" });
}
