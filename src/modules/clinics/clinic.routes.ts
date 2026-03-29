import { FastifyInstance } from "fastify";
import { registerClinicController } from "./clinic.controller";

export async function clinicRoutes(app: FastifyInstance) {
    app.post("/register", {config: {rateLimit: {max: 5, timeWindow: '1 minute'}}}, async(req, res) => await registerClinicController(req, res))
}