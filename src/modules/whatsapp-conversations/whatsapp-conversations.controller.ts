import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import makeCreateWhatsappConversation from "./factories/make-create-whatsapp-conversation.factory";
import makeFindAllByClinicIdFactory from "./factories/make-find-all-by-clinic-id.factory";
import makeFindWhatsappConversationFactory from "./factories/make-find-whatsapp-conversation.factory";
import makeListWhatsappConversationsFactory from "./factories/make-list-whatsapp-conversations.factory";

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

export async function listWhatsappConversationsController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const listParamsSchema = z.object({
    clinicId: z.string(),
  });

  const { clinicId } = listParamsSchema.parse(req.params);
  const listWhatsappConversationsService =
    makeListWhatsappConversationsFactory();

  const { conversations } = await listWhatsappConversationsService.exec({
    clinicId,
  });

  return res.status(200).send({
    conversations: conversations.map(presentWhatsappConversation),
  });
}

export async function findAllByClinicIdController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const findAllParamsSechema = z.object({
    clinicId: z.string(),
  });

  const { clinicId } = findAllParamsSechema.parse(req.params);

  const findAllByClinicIdService = makeFindAllByClinicIdFactory();

  const conversationList = await findAllByClinicIdService.exec(clinicId);

  return res.status(200).send({
    data: conversationList,
  });
}
