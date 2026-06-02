import { prisma } from "@/db/prisma";
import { verifyAccessToken } from "@/lib/jwt";
import { FastifyInstance } from "fastify";
import { ClinicRepository } from "../clinics/repositories/clinic-repository";
import {
  addRealtimeClient,
  getRealtimeClientsCount,
  removeRealtimeClient,
} from "./realtime-broadcaster";

export async function realtimeRoutes(app: FastifyInstance) {
  app.get("/ws", { websocket: true }, async (socket, req) => {
    const query = req.query as { token?: string; clinicId?: string };
    const token = query.token;
    const clinicId = query.clinicId;

    if (!token) {
      socket.close(1008, "Unauthorized");
      return;
    }

    if (!clinicId) {
      socket.close(1008, "Clinic ID is required");
      return;
    }

    try {
      const clinicRepository = new ClinicRepository();
      const doesTheClinicExist = await clinicRepository.findById(
        prisma,
        clinicId,
      );
      const payload = verifyAccessToken(token);

      if (!doesTheClinicExist) {
        socket.close(1008, "Clinic not found");
        return;
      }

      addRealtimeClient({
        clinicId: clinicId,
        socket,
        userId: payload.sub,
      });

      app.log.info(
        {
          clinicId: clinicId,
          clients: getRealtimeClientsCount(),
          userId: payload.sub,
        },
        "Realtime websocket connected",
      );

      socket.send(
        JSON.stringify({
          event: "realtime:connected",
          payload: {
            clinicId: clinicId,
          },
        }),
      );
    } catch {
      socket.close(1008, "Invalid or expired token");
      return;
    }

    socket.on("close", () => {
      removeRealtimeClient(socket);
      app.log.info(
        { clients: getRealtimeClientsCount() },
        "Realtime websocket disconnected",
      );
    });

    socket.on("error", (err) => {
      removeRealtimeClient(socket);
      app.log.error({ err }, "Erro no socket");
    });
  });
}
