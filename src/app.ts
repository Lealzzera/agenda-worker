import { FastifyInstance } from "fastify";
import { planRoutes } from "./modules/plan/plan.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { clinicRoutes } from "./modules/clinics/clinic.routes";

export default async function routes(app: FastifyInstance) {
    app.register(planRoutes, {prefix: '/plans'})
    app.register(authRoutes, {prefix: '/auth'})
    app.register(clinicRoutes, {prefix: '/clinic'})
} 