import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import makeCreatePlanService from "./factories/makeCreatePlanService";


export async function createPlanController(req: FastifyRequest, res: FastifyReply) {
    const createPlanBodySchema = z.object({
        name: z.string(),
        code: z.string(),
        priceMonthly: z.number().int(),
        maxUsers: z.number().int(),
        maxWhatsappSessions: z.number().int(),
        maxMonthlySchedules: z.number().int()
    })

    const { name, code, priceMonthly, maxUsers, maxWhatsappSessions, maxMonthlySchedules } = createPlanBodySchema.parse(req.body)

    const planService = makeCreatePlanService()
    await planService.exec({
            name,
            code,
            priceMonthly,
            maxUsers,
            maxWhatsappSessions,
            maxMonthlySchedules
    })

    return res.status(201).send({message: "Plan created successfully"})
}
