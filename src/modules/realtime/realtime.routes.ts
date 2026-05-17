import { FastifyInstance } from "fastify";

export async function realtimeRoutes(app: FastifyInstance) {
  app.get("/ws", { websocket: true }, (socket) => {
    app.log.info("Realtime routes initialized");

    socket.on("message", (rawMessage) => {
      const text = rawMessage.toString();
      app.log.info(`Received message: ${text}`);

      if (text === "ping") {
        socket.send("pong");
      }
    });

    socket.on("close", () => {
      app.log.info("Cliente desconectou");
    });

    socket.on("error", (err) => {
      app.log.error({ err }, "Erro no socket");
    });
  });
}
