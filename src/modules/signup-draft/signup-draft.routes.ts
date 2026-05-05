import { FastifyInstance } from "fastify";
import { signupDraftController } from "./signup-draft.controller";

export async function signupDraftRoutes(app: FastifyInstance) {
  app.post(
    "/register",
    { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } },
    async (req, res) => await signupDraftController(req, res),
  );
}
