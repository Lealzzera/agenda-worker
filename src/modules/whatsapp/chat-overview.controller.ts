import { env } from "@/env";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

function getUnreadCount(chat: any) {
  const unreadCount =
    chat.unreadCount ??
    chat.unread_count ??
    chat._chat?.unreadCount ??
    chat._chat?.unread_count ??
    0;

  return Number(unreadCount) || 0;
}

function getLastMessageAck(chat: any) {
  const ack =
    chat.lastMessage?.ack ??
    chat.lastMessage?._data?.ack ??
    chat.lastMessage?.metadata?.ack ??
    null;

  return ack === null ? null : Number(ack);
}

function getLastMessageFromMe(chat: any) {
  return Boolean(
    chat.lastMessage?.fromMe ??
      chat.lastMessage?._data?.fromMe ??
      chat.lastMessage?.metadata?.fromMe ??
      false,
  );
}

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
    const response = await fetch(
      `${env.WAHA_URL}/${sessionName}/chats/overview?merge=true&limit=${pagination.limit}&offset=${pagination.offset || 0}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": env.WAHA_API_KEY,
        },
      },
    );

    const data = await response.json();

    const listWihtoutGroupChats = data.filter((chat: any) =>
      chat.id.includes("@c.us"),
    );

    const listContentFiltered = listWihtoutGroupChats.map((chat: any) => {
      const formattedNumber = chat.id.replace(
        /^(\d{2})(\d{2})(\d{4,5}?)(\d{4})@c\.us$/,
        "+$1 $2 $3-$4",
      );
      return {
        id: chat.id,
        phoneNumber: formattedNumber,
        contactName: !chat.name ? formattedNumber : chat.name,
        contactPicture: chat.picture,
        lastMessage: {
          message: chat.lastMessage?.hasMedia
            ? "Mensagem com arquivo de mídia"
            : chat.lastMessage?.body,
          hasMedia: chat.lastMessage?.hasMedia,
          sentAt: chat.lastMessage?.timestamp,
          ack: getLastMessageAck(chat),
          fromMe: getLastMessageFromMe(chat),
        },
        unreadCount: getUnreadCount(chat),
      };
    });

    return res.status(200).send(listContentFiltered);
  } catch (error) {
    return res.status(500).send({ error: "Failed to get chat overview" });
  }
}
