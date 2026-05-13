import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PlanRepository } from "@/modules/plan/repositories/plan-repository";
import { RegistrationDraftRepository } from "./repositories/registration-draft-repository";
import { SaveRegistrationDraftService } from "./use-cases/save-registration-draft.service";

const saveDraftSchema = z.object({
  userFullName: z.string(),
  userEmail: z.email(),
  password: z.string().min(8),
  userPictureUrl: z.url().optional().or(z.literal("")).transform((val) => (val === "" ? undefined : val)),
  clinicName: z.string(),
  clinicType: z.enum(["DENTAL", "MEDICAL", "AESTHETIC", "PSYCHOLOGY", "OTHER"]).optional(),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  clinicEmail: z.email().optional().or(z.literal("")).transform((val) => (val === "" ? undefined : val)),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  planId: z.string(),
  workingHours: z.array(z.object({
    weekday: z.enum(["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]),
    startTime: z.string(),
    endTime: z.string(),
  })).optional(),
  services: z.array(z.object({
    name: z.string(),
    durationMinutes: z.coerce.number().int().positive(),
    priceCents: z.coerce.number().int().nonnegative().optional(),
  })).optional(),
  settings: z.object({
    chargesEvaluation: z.boolean().optional(),
    evaluationPriceCents: z.coerce.number().int().nonnegative().optional(),
  }).optional(),
});

export async function saveRegistrationDraftController(req: FastifyRequest, res: FastifyReply) {
  const data = saveDraftSchema.parse(req.body);

  const service = new SaveRegistrationDraftService(
    new RegistrationDraftRepository(),
    new PlanRepository()
  );

  const draft = await service.exec(data);

  return res.status(200).send({ draftId: draft.id });
}
