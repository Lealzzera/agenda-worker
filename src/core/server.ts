import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import websocket from "@fastify/websocket";
import Fastify from "fastify";
import z, { ZodError } from "zod";
import routes from "../app";
import { env } from "../env";
import { AppError } from "../errors/app.error";

export function buildServer() {
  const app = Fastify({
    logger: true,
  });

  app.register(websocket);
  app.register(cookie, {
    secret: env.COOKIE_SECRET,
  });
  app.register(helmet);
  app.register(cors, {
    origin: [env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  });
  app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: "1 minute",
  });

  app.setErrorHandler((error, request, response) => {
    if (error instanceof ZodError) {
      return response.status(400).send({
        message: "Validation error",
        issues: z.treeifyError(error),
      });
    }

    if (error instanceof AppError) {
      return response.status(error.statusCode).send({
        message: error.message,
      });
    }

    request.log.error(error);

    return response.status(500).send({
      message: "Internal server error",
    });
  });

  app.register(routes, {
    prefix: "/api/v1",
  });

  return app;
}
