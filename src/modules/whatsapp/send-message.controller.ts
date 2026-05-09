import { env } from "@/env";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function sendMessageController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const messageBodySchema = z.object({
    chatId: z.string(),
    id: z.string().optional(),
    replyTo: z.string().optional(),
    text: z.string(),
    linkPreview: z.boolean().optional(),
    linkPreviewHighQuality: z.boolean().optional(),
    session: z.string(),
  });

  const {
    chatId,
    id,
    replyTo,
    text,
    linkPreview,
    linkPreviewHighQuality,
    session,
  } = messageBodySchema.parse(req.body);

  if (!env.WAHA_URL || !env.WAHA_API_KEY) {
    return res
      .status(500)
      .send({ error: "WAHA_URL or WAHA_API_KEY not configured" });
  }

  try {
    const sendMessage = await fetch(`${env.WAHA_URL}/sendText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": env.WAHA_API_KEY,
      },

      body: JSON.stringify({
        chatId,
        id,
        reply_to: replyTo,
        text,
        linkPreview,
        linkPreviewHighQuality,
        session,
      }),
    });

    console.log({ sendMessage });

    if (!sendMessage.ok) {
      return res.status(500).send({ error: "Failed to send message" });
    }

    return res.status(200).send({ success: true });
  } catch (error) {
    return res.status(500).send({ error: "Failed to send message" });
  }
}
