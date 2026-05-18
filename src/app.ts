import { FastifyInstance } from "fastify";
import { appointmentRoutes } from "./modules/appointments/appointment.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { clinicSettingsRoutes } from "./modules/clinic-settings/clinic-settings.routes";
import { clinicSpecialDateRoutes } from "./modules/clinic-special-date/repositories/clinic-special-date.routes";
import { clinicRoutes } from "./modules/clinics/clinic.routes";
import { planRoutes } from "./modules/plan/plan.routes";
import { realtimeRoutes } from "./modules/realtime/realtime.routes";
import { signupDraftRoutes } from "./modules/signup-draft/signup-draft.routes";
import { stripeRoutes } from "./modules/stripe/stripe.routes";
import { userRoutes } from "./modules/user/user.routes";
import { whatsappRoutes } from "./modules/whatsapp/whatsapp.routes";

export default async function routes(app: FastifyInstance) {
  app.register(planRoutes, { prefix: "/plans" });
  app.register(authRoutes, { prefix: "/auth" });
  app.register(clinicRoutes, { prefix: "/clinic" });
  app.register(userRoutes, { prefix: "/user" });
  app.register(stripeRoutes, { prefix: "/stripe" });
  app.register(appointmentRoutes, { prefix: "/appointments" });
  app.register(signupDraftRoutes, { prefix: "/signup-draft" });
  app.register(whatsappRoutes, { prefix: "/whatsapp" });
  app.register(realtimeRoutes, { prefix: "/realtime" });
  app.register(clinicSpecialDateRoutes, { prefix: "/clinic-special-date" });
  app.register(clinicSettingsRoutes, { prefix: "/clinic-settings" });
}
