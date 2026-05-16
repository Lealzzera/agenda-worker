import { FastifyInstance } from "fastify";
import {
  checkUserEmailController,
  registerUserController,
} from "./user.controller";

export async function userRoutes(app: FastifyInstance) {
  app.post(
    "/register",
    { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } },
    async (req, res) => registerUserController(req, res),
  );
  app.get(
    "/check-email",
    {
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
      schema: {
        querystring: {
          type: "object",
          properties: {
            email: { type: "string" },
          },
          required: ["email"],
        },
      },
    },
    async (req, res) => checkUserEmailController(req, res),
  );
}
