import { verifyJwt } from "@/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import {
  createSpecialDateController,
  deleteSpecialDateController,
  listSpecialDateController,
  updateSpecialDateController,
} from "./clinic-special-date.controller";

export async function clinicSpecialDateRoutes(app: FastifyInstance) {
  app.post(
    "/create",
    {
      preHandler: [verifyJwt],
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    },
    async (req, res) => await createSpecialDateController(req, res),
  );

  app.get(
    "/list/:clinicId",
    {
      preHandler: [verifyJwt],
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
    },
    async (req, res) => await listSpecialDateController(req, res),
  );

  app.patch(
    "/update/:clinicId/:date",
    {
      preHandler: [verifyJwt],
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    },
    async (req, res) => await updateSpecialDateController(req, res),
  );

  app.delete(
    "/delete/:clinicId/:date",
    {
      preHandler: [verifyJwt],
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    },
    async (req, res) => await deleteSpecialDateController(req, res),
  );
}
