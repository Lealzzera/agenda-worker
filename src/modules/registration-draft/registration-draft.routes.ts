import { FastifyInstance } from "fastify";
import { saveRegistrationDraftController } from "./registration-draft.controller";

export async function registrationDraftRoutes(app: FastifyInstance) {
  app.post("/", async (req, res) => {
    return saveRegistrationDraftController(req, res);
  });
}
