import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { makeWhatsAppServiceFactory } from "./factories/make-whatsapp-service.factory";

const startSessionSchema = z.object({
    name: z.string(),
    engine: z.string().default("WEBJS"),
});

const sendMessageSchema = z.object({
    session: z.string(),
    chatId: z.string(),
    text: z.string(),
});

export async function startSessionController(req: FastifyRequest, res: FastifyReply) {
    const data = startSessionSchema.parse(req.body);

    const whatsappService = makeWhatsAppServiceFactory();
    await whatsappService.startSession({
        name: data.name,
        config: { engine: data.engine },
    });

    return res.status(201).send({ message: "WhatsApp session started" });
}

export async function stopSessionController(req: FastifyRequest, res: FastifyReply) {
    const { session } = req.params as { session: string };

    const whatsappService = makeWhatsAppServiceFactory();
    await whatsappService.stopSession(session);

    return res.send({ message: "WhatsApp session stopped" });
}

export async function sendMessageController(req: FastifyRequest, res: FastifyReply) {
    const data = sendMessageSchema.parse(req.body);

    const whatsappService = makeWhatsAppServiceFactory();
    await whatsappService.sendMessage(data);

    return res.send({ message: "Message sent" });
}

export async function getQrCodeController(req: FastifyRequest, res: FastifyReply) {
    const { session } = req.params as { session: string };

    const whatsappService = makeWhatsAppServiceFactory();
    const qrCode = await whatsappService.getQrCode(session);

    return res.type("text/html").send(qrCode);
}

export async function getSessionsController(_req: FastifyRequest, res: FastifyReply) {
    const whatsappService = makeWhatsAppServiceFactory();
    const sessions = await whatsappService.getSessions();

    return res.send({ sessions });
}

export async function wahaWebhookController(req: FastifyRequest, res: FastifyReply) {
    const webhookSchema = z.object({
        session: z.string(),
        payload: z.any(),
    });

    const data = webhookSchema.parse(req.body);

    // TODO: Process incoming WhatsApp message
    // This is where you'll integrate with Aurora (AI agent)
    // or handle appointment-related logic
    console.log("WhatsApp webhook received:", JSON.stringify(data, null, 2));

    return res.status(200).send({ received: true });
}
