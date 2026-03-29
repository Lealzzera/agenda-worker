import { FastifyInstance } from "fastify";
import { registerUserController } from "./user.controller";

export async function userRoutes(app: FastifyInstance) {
    app.post('/register', {config: {rateLimit: {max: 5, timeWindow: '1 minute'}}}, async (req, res) => registerUserController(req, res))
}