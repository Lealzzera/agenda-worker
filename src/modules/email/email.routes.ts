import { FastifyInstance } from "fastify";
import { sendEmailController } from "./email.controller";

export async function emailRoutes(app: FastifyInstance) {
    app.post('/send', sendEmailController)
}