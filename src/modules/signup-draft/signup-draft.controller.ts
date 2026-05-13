import { ClinicType, Weekday } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { makeRegisterSignupDraftFactory } from "./factories/make-register-signup-draft-factory";

export async function signupDraftController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const registerSignupDraftBodySchema = z.object({
    email: z.email(),
    password: z.string().min(6),
    fullName: z.string(),
    selectedPlanId: z.uuid(),
    data: z.object({
      clinicName: z.string(),
      clinicType: z.nativeEnum(ClinicType),
      phone: z.string(),
      address: z.string(),
      postalCode: z.string(),
      city: z.string(),
      state: z.string(),
      planId: z.string(),
      workingHours: z.array(
        z.object({
          weekday: z.nativeEnum(Weekday),
          startTime: z.string(),
          endTime: z.string(),
        }),
      ),
      services: z.array(
        z.object({
          name: z.string(),
          durationMinutes: z.number(),
          priceCents: z.number().optional(),
        }),
      ),
      settings: z.object({
        chargesEvaluation: z.boolean().optional(),
        evaluationPriceCents: z.number().optional(),
      }),
    }),
    status: z.enum(["PENDING", "COMPLETED", "EXPIRED"]).optional(),
  });

  const { email, password, fullName, selectedPlanId, data, status } =
    registerSignupDraftBodySchema.parse(req.body);

  const registerSignupDraftService = makeRegisterSignupDraftFactory();
  const draft = await registerSignupDraftService.exec({
    email,
    password,
    fullName,
    selectedPlanId,
    data,
    status,
  });

  // Retorna o draftId para o frontend usar na criação do checkout Stripe
  return res.status(201).send({ draftId: draft.id });
}
