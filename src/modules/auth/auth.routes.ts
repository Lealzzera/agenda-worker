import { FastifyInstance } from "fastify";
import {
  loginController,
  refreshTokenController,
  requestPasswordResetController,
  resetPasswordController,
} from "./auth.controller";

export async function authRoutes(app: FastifyInstance) {
  app.post("/login", async (req, res) => await loginController(req, res));
  app.post(
    "/refresh",
    async (req, res) => await refreshTokenController(req, res),
  );
  app.post("/forgot-password", async (req, res) =>
    requestPasswordResetController(req, res),
  );
  app.post("/reset-password", async (req, res) =>
    resetPasswordController(req, res),
  );
}
