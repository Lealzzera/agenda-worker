import { FastifyInstance } from "fastify";
import { loginController } from "./auth.controller";

export async function authRoutes(app: FastifyInstance) {
    app.post('/login', async(req, res) => await loginController(req, res))
}