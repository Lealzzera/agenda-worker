import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import makeCreateRegisterPlanServiceFactory from "./factories/make-create-register-plan-service.factory";


export async function createPlanController(req: FastifyRequest, res: FastifyReply) {
    const createPlanBodySchema = z.object({
        name: z.string(),
        code: z.string(),
        priceMonthly: z.number().int(),
        maxUsers: z.number().int(),
        maxWhatsappSessions: z.number().int(),
        maxMonthlyAppointments: z.number().int()
    })

    const { name, code, priceMonthly, maxUsers, maxWhatsappSessions, maxMonthlyAppointments } = createPlanBodySchema.parse(req.body)

    const planService = makeCreateRegisterPlanServiceFactory()
    await planService.exec({
            name,
            code,
            priceMonthly,
            maxUsers,
            maxWhatsappSessions,
            maxMonthlyAppointments
    })

    return res.status(201).send({message: "Plan created successfully"})
}
