import { FastifyInstance } from "fastify";
import { planRoutes } from "./modules/plan/plan.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { clinicRoutes } from "./modules/clinics/clinic.routes";
import { userRoutes } from "./modules/user/user.routes";
import { whatsappRoutes } from "./modules/whatsapp/whatsapp.routes";

export default async function routes(app: FastifyInstance) {
    app.register(planRoutes, { prefix: '/plans' })
    app.register(authRoutes, { prefix: '/auth' })
    app.register(clinicRoutes, { prefix: '/clinic' })
    app.register(userRoutes, { prefix: '/user' })
    app.register(whatsappRoutes, { prefix: '/whatsapp' })
} 