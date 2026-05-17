import { FastifyInstance } from "fastify";
import { loginController, refreshTokenController } from "./auth.controller";

export async function authRoutes(app: FastifyInstance) {
  app.post("/login", async (req, res) => await loginController(req, res));
  app.post(
    "/refresh",
    async (req, res) => await refreshTokenController(req, res),
  );
}
