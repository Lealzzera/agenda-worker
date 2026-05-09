import { env } from "@/env";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function chatOverviewController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const chatOverviewControllerParam = z.object({
    sessionName: z.string(),
  });
  const chatOverviewControllerBodySchema = z.object({
    pagination: z.object({
      limit: z.number(),
      offset: z.number().optional(),
    }),
  });

  const { sessionName } = chatOverviewControllerParam.parse(req.params);
  const { pagination } = chatOverviewControllerBodySchema.parse(req.body);

  if (!env.WAHA_URL || !env.WAHA_API_KEY) {
    return res
      .status(500)
      .send({ error: "WAHA_URL or WAHA_API_KEY not found" });
  }
  try {
    const bodyJson = {
      pagination: {
        ...pagination,
        merge: false,
      },
    };
    const response = await fetch(
      `${env.WAHA_URL}/${sessionName}/chats/overview`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": env.WAHA_API_KEY,
        },
        body: JSON.stringify(bodyJson),
      },
    );

    const data = await response.json();

    const listWihtoutGroupChats = data.filter((chat: any) =>
      chat.id.includes("c.us"),
    );

    const listContentFiltered = listWihtoutGroupChats.map((chat: any) => {
      const formattedNumber = chat.id.replace(
        /^(\d{2})(\d{2})(\d{5})(\d{4})@c\.us$/,
        "+$1 $2 $3-$4",
      );
      return {
        id: formattedNumber,
        contactName: chat.name ?? formattedNumber,
        contactPicture: chat.picture,
        lastMessage: {
          message: chat.lastMessage?.hasMedia
            ? "Mensagem com arquivo de mídia"
            : chat.lastMessage?.body,
          hasMedia: chat.lastMessage?.hasMedia,
          sentAt: chat.lastMessage?.timestamp,
        },
      };
    });

    console.log({ bodyJson, listContentFiltered });
    return res.status(200).send(listContentFiltered);
  } catch (error) {
    return res.status(500).send({ error: "Failed to get chat overview" });
  }
}
