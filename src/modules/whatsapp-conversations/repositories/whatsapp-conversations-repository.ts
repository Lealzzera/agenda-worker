import { PrismaClientOrTx } from "@/types/prisma.type";
import { WhatsAppConversation } from "@prisma/client";
import {
  CreateWhatsappConversationsType,
  FindConversationByChatAndClinicIdType,
  IWhatsappConversationsRepository,
  UpdateWhatsappConversationsType,
} from "./whatsapp-conversations-repository.interface";

export class WhatsappConversationsRepository implements IWhatsappConversationsRepository {
  async create(
    client: PrismaClientOrTx,
    {
      chatId,
      session,
      clinicId,
      aiEnabled,
      phoneNumber,
    }: CreateWhatsappConversationsType,
  ): Promise<WhatsAppConversation> {
    const conversationData = await client.whatsAppConversation.create({
      data: {
        session,
        chat_id: chatId,
        clinic_id: clinicId,
        ai_enabled: aiEnabled,
        phone_number: phoneNumber,
      },
    });

    return conversationData;
  }

  async upsertWhatsappConversation(
    client: PrismaClientOrTx,
    {
      chatId,
      session,
      clinicId,
      aiEnabled,
      phoneNumber,
    }: CreateWhatsappConversationsType,
  ): Promise<WhatsAppConversation> {
    const conversationData = await client.whatsAppConversation.upsert({
      where: {
        clinic_id_session_chat_id: {
          clinic_id: clinicId,
          session,
          chat_id: chatId,
        },
      },
      create: {
        session,
        chat_id: chatId,
        clinic_id: clinicId,
        ai_enabled: aiEnabled,
        phone_number: phoneNumber,
      },
      update: {
        ai_enabled: aiEnabled,
        phone_number: phoneNumber,
      },
    });

    return conversationData;
  }

  async updateWhatsappConversations(
    client: PrismaClientOrTx,
    { aiEnabled, id }: UpdateWhatsappConversationsType,
  ): Promise<WhatsAppConversation> {
    const conversationData = await client.whatsAppConversation.update({
      where: {
        id,
      },
      data: {
        ai_enabled: aiEnabled,
      },
    });
    return conversationData;
  }

  async findConversationByChatAndClinicId(
    client: PrismaClientOrTx,
    { chatId, clinicId }: FindConversationByChatAndClinicIdType,
  ): Promise<WhatsAppConversation | null> {
    const conversationData = client.whatsAppConversation.findFirst({
      where: {
        chat_id: chatId,
        clinic_id: clinicId,
      },
    });
    return conversationData || null;
  }
}
