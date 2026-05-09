import { env } from "@/env";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function getChatMessagesController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const getChatMessagesSchema = z.object({
    params: z.object({
      sessionName: z.string(),
      chatId: z.string(),
    }),
    query: z.object({
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      downloadMedia: z
        .enum(["true", "false"])
        .optional()
        .transform((value) =>
          value === undefined ? undefined : value === "true",
        ),
      limit: z.coerce.number().int().positive().default(10),
      offset: z.coerce.number().int().nonnegative().optional(),
    }),
  });

  const { params, query } = getChatMessagesSchema.parse({
    params: req.params,
    query: req.query,
  });

  const { sessionName, chatId } = params;
  const { sortBy, sortOrder, downloadMedia, limit, offset } = query;

  if (!env.WAHA_URL || !env.WAHA_API_KEY) {
    return res
      .status(500)
      .send({ error: "WAHA_URL or WAHA_API_KEY not configured" });
  }

  try {
    const queryParams = new URLSearchParams({
      merge: "true",
      limit: String(limit),
    });
    if (sortBy) queryParams.append("sortBy", sortBy);
    if (sortOrder) queryParams.append("sortOrder", sortOrder);
    if (downloadMedia !== undefined) {
      queryParams.append("downloadMedia", String(downloadMedia));
    }
    if (offset !== undefined) queryParams.append("offset", String(offset));

    const response = await fetch(
      `${env.WAHA_URL}/${sessionName}/chats/${chatId}/messages?${queryParams.toString()}`,
      {
        headers: {
          "X-Api-Key": env.WAHA_API_KEY,
        },
      },
    );

    const data = await response.json();
    const messagesMapped = (Array.isArray(data) ? data : []).map(
      (message: any) => ({
        id: message.id,
        message: message.body,
        timestamp: message.timestamp,
        fromMe: message.fromMe,
        source: message.source,
        hasMedia: message.hasMedia,
      }),
    );

    return res.send({
      messages: messagesMapped,
      count: messagesMapped.length,
    });
  } catch (error) {
    return res.status(500).send({ error: "Failed to get chat messages" });
  }
}
