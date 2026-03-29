import { FastifyInstance } from "fastify";
import { verifyJwt } from "../../middlewares/verify-jwt";
import { verifyAdmin } from "../../middlewares/verify-admin";
import { createPlanController } from "./plan.controller";

export async function planRoutes(app: FastifyInstance) {
    app.addHook('preHandler', verifyJwt)
    app.addHook('preHandler', verifyAdmin)
    app.post('/register', async(req, res) => await createPlanController(req, res))
}