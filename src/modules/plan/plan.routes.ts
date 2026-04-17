import { verifyAdmin } from "@/middlewares/verify-admin";
import { verifyJwt } from "@/middlewares/verify-jwt";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  createPlanController,
  getPlanController,
  patchUpdatePlanController,
  UpdatePlanBody,
} from "./plan.controller";

type UpdatePlanParams = {
  planId: string;
};

export async function planRoutes(app: FastifyInstance) {
  app.get(
    "/list",
    async (req: FastifyRequest, res: FastifyReply) =>
      await getPlanController(req, res),
  );
  app.register(async function (protectedRoutes) {
    protectedRoutes.addHook("preHandler", verifyJwt);
    protectedRoutes.addHook("preHandler", verifyAdmin);
    protectedRoutes.post(
      "/register",
      async (req: FastifyRequest, res: FastifyReply) =>
        await createPlanController(req, res),
    );
    protectedRoutes.patch(
      "/:planId",
      async (
        req: FastifyRequest<{ Params: UpdatePlanParams; Body: UpdatePlanBody }>,
        res: FastifyReply,
      ) => await patchUpdatePlanController(req, res),
    );
  });
}
