import { FastifyInstance } from "fastify";
import {
    startSessionController,
    stopSessionController,
    sendMessageController,
    getQrCodeController,
    getSessionsController,
    wahaWebhookController,
} from "./whatsapp.controller";

export async function whatsappRoutes(app: FastifyInstance) {
    app.post("/sessions", async (req, res) => startSessionController(req, res));
    app.delete("/sessions/:session", async (req, res) => stopSessionController(req, res));
    app.get("/sessions", async (_req, res) => getSessionsController(_req, res));
    app.post("/send", async (req, res) => sendMessageController(req, res));
    app.get("/qr/:session", async (req, res) => getQrCodeController(req, res));

    app.post("/webhook", {
        config: {
            rateLimit: { max: 100, timeWindow: "1 minute" },
        },
    }, async (req, res) => wahaWebhookController(req, res));
}
