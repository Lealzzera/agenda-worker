import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import makeCreateRegisterPlanServiceFactory from "./factories/make-create-register-plan-service.factory";
import { makeGetPlansListServiceFactory } from "./factories/make-get-plans-list-service.factory";
import { makeUpdatePlanServiceFactory } from "./factories/make-update-plan-service.factory";

type UpdatePlanParams = {
  planId: string;
};

export type UpdatePlanBody = {
  name?: string;
  description?: string;
  priceMonthly?: number;
  maxUsers?: number;
  maxWhatsappSessions?: number;
  maxMonthlyAppointments?: number | null;
  stripePriceId: string;
};

export async function createPlanController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const createPlanBodySchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    code: z.string(),
    priceMonthly: z.number().int(),
    maxUsers: z.number().int().optional(),
    maxWhatsappSessions: z.number().int().optional(),
    maxMonthlyAppointments: z.number().int().optional().nullable(),
    stripePriceId: z.string(),
  });

  const {
    name,
    description,
    code,
    priceMonthly,
    maxUsers,
    maxWhatsappSessions,
    maxMonthlyAppointments,
    stripePriceId,
  } = createPlanBodySchema.parse(req.body);

  const planService = makeCreateRegisterPlanServiceFactory();
  await planService.exec({
    name,
    description,
    code,
    priceMonthly,
    maxUsers,
    maxWhatsappSessions,
    maxMonthlyAppointments,
    stripePriceId,
  });

  return res.status(201).send({ message: "Plan created successfully" });
}

export async function getPlanController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const planService = makeGetPlansListServiceFactory();
  const planList = await planService.exec();
  return res.status(200).send(planList);
}

export async function patchUpdatePlanController(
  req: FastifyRequest<{ Params: UpdatePlanParams; Body: UpdatePlanBody }>,
  res: FastifyReply,
) {
  const { planId } = req.params;
  const updatePlanBodySchema = z
    .object({
      name: z.string().optional(),
      description: z.string().optional(),
      priceMonthly: z.number().int().optional(),
      maxUsers: z.number().int().optional(),
      maxWhatsappSessions: z.number().int().optional(),
      maxMonthlyAppointments: z.number().int().optional().nullable(),
      stripePriceId: z.string().optional(),
    })
    .optional();

  const planData = updatePlanBodySchema.parse(req.body);

  const {
    name,
    description,
    priceMonthly,
    maxUsers,
    maxMonthlyAppointments,
    maxWhatsappSessions,
    stripePriceId,
  } = planData || {};
  const updatePlanService = makeUpdatePlanServiceFactory();
  await updatePlanService.exec({
    id: planId,
    data: {
      name,
      description,
      priceMonthly,
      maxUsers,
      maxMonthlyAppointments,
      maxWhatsappSessions,
      stripePriceId,
    },
  });
  return res.status(200).send({ message: "Plan updated successfully" });
}
