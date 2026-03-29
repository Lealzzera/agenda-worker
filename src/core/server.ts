import Fastify from "fastify"
import routes from "../app"
import helmet from "@fastify/helmet"
import cors from "@fastify/cors"
import rateLimit from "@fastify/rate-limit"
import z, { ZodError } from "zod"
import { env } from "../env"
import { AppError } from "../errors/app.error"

export function buildServer() {
  const app = Fastify({
    logger: true,
  })

  app.register(helmet)
  app.register(cors, {
    origin: [env.FRONTEND_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
  app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
  })

  app.setErrorHandler((error, request, response) => {
    if(error instanceof ZodError) {
      return response.status(400).send({
        message: 'Validation error',
        issues: z.treeifyError(error)
      })
    }

    if(error instanceof AppError) {
      return response.status(error.statusCode).send({
        message: error.message,
      })
    }

    request.log.error(error)

    return response.status(500).send({
      message: 'Internal server error',
    })
  })

  app.register(routes)

  return app
}