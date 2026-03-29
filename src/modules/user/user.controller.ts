import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import makeRegisterUserServiceFactory from "./make-regiser-user-service-factory";

export async function registerUserController(req: FastifyRequest, res: FastifyReply) {
    const registerUserBodySchema = z.object({
        fullName: z.string(),
        email: z.email(),
        password: z.string().min(6),
        clinicId: z.uuid(),
        pictureUrl: z.url().optional(),
        userRole: z.enum(["ADMIN", "OWNER", "MEMBER"]),
    })

    const { clinicId, email, fullName, password, pictureUrl, userRole } = registerUserBodySchema.parse(req.body)

    const registerUserService = makeRegisterUserServiceFactory()
    const user = await registerUserService.exec({clinicId, email, fullName, password, pictureUrl, userRole})

    return res.status(201).send({ user })
}