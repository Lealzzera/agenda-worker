import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import makeCreateWhatsappConversation from "./factories/make-create-whatsapp-conversation.factory";
import makeFindWhatsappConversationFactory from "./factories/make-find-whatsapp-conversation.factory";

function presentWhatsappConversation(conversation: {
  id: string;
  chat_id: string;
  clinic_id: string;
  session: string;
  phone_number: string;
  ai_enabled: boolean;
}) {
  return {
    id: conversation.id,
    chatId: conversation.chat_id,
    clinicId: conversation.clinic_id,
    session: conversation.session,
    phoneNumber: conversation.phone_number,
    aiEnabled: conversation.ai_enabled,
  };
}

export async function createWhatsappConversationController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const createBodySchema = z.object({
    clinicId: z.string(),
    chatId: z.string(),
    aiEnabled: z.boolean(),
    session: z.string(),
    phoneNumber: z.string(),
  });

  const { clinicId, chatId, aiEnabled, session, phoneNumber } =
    createBodySchema.parse(req.body);

  const createWhatsappConversationService = makeCreateWhatsappConversation();

  const conversation = await createWhatsappConversationService.exec({
    clinicId,
    chatId,
    aiEnabled,
    session,
    phoneNumber,
  });

  return res.status(201).send(presentWhatsappConversation(conversation));
}

export async function updateWhatsappConversationController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const updateParamsSchema = z.object({
    clinicId: z.string(),
    chatId: z.string(),
  });

  const updateBodySchema = z.object({
    aiEnabled: z.boolean(),
    session: z.string().default("default"),
    phoneNumber: z.string(),
  });

  const { clinicId, chatId } = updateParamsSchema.parse(req.params);
  const { aiEnabled, session, phoneNumber } = updateBodySchema.parse(req.body);

  const createWhatsappConversationService = makeCreateWhatsappConversation();

  const conversation = await createWhatsappConversationService.exec({
    clinicId,
    chatId,
    aiEnabled,
    session,
    phoneNumber,
  });

  return res.status(200).send(presentWhatsappConversation(conversation));
}

export async function findWhatsappConversationController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const findParamsSchema = z.object({
    chatId: z.string(),
    clinicId: z.string(),
  });

  const { chatId, clinicId } = findParamsSchema.parse(req.params);

  const findWhatsappConversationService = makeFindWhatsappConversationFactory();

  const conversation = await findWhatsappConversationService.exec({
    chatId,
    clinicId,
  });

  return res.status(200).send(conversation);
}
