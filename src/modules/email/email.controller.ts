import { FastifyReply, FastifyRequest } from "fastify";
import { SendEmailService } from "./send-email.service";
import { UserRepository } from "../user/repositories/user-respository";

export async function sendEmailController(req: FastifyRequest, res: FastifyReply) {
    const email = (req.body as any).email
    const userRepository = new UserRepository()
    const emailService = new SendEmailService(userRepository)
    await emailService.exec(email)
}