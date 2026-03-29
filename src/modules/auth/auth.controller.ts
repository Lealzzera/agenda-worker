import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import makeAuthServiceFactory from "./factories/make-auth-service.factory";

export async function loginController(req: FastifyRequest, res: FastifyReply) {
    const bodySchema = z.object({
        email: z.email(),
        password: z.string()
    })


    const {email, password} = bodySchema.parse(req.body)

    const authService = makeAuthServiceFactory()
    const {accessToken, refreshToken} = await authService.exec({
        email,
        password
    })

    return {
        accessToken,
        refreshToken
    }
}