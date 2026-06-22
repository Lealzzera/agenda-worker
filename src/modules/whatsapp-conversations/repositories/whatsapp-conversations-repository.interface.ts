import { PrismaClientOrTx } from "@/types/prisma.type";
import { WhatsAppConversation } from "@prisma/client";

export type CreateWhatsappConversationsType = {
  chatId: string;
  session: string;
  clinicId: string;
  aiEnabled: boolean;
  phoneNumber: string;
};

export type UpdateWhatsappConversationsType = {
  aiEnabled: boolean;
  id: string;
};

export type FindConversationByChatAndClinicIdType = {
  chatId: string;
  clinicId: string;
};

export interface IWhatsappConversationsRepository {
  create(
    client: PrismaClientOrTx,
    {
      chatId,
      session,
      clinicId,
      aiEnabled,
      phoneNumber,
    }: CreateWhatsappConversationsType,
  ): Promise<WhatsAppConversation>;

  upsertWhatsappConversation(
    client: PrismaClientOrTx,
    {
      chatId,
      session,
      clinicId,
      aiEnabled,
      phoneNumber,
    }: CreateWhatsappConversationsType,
  ): Promise<WhatsAppConversation>;

  updateWhatsappConversations(
    client: PrismaClientOrTx,
    { aiEnabled, id }: UpdateWhatsappConversationsType,
  ): Promise<WhatsAppConversation>;

  findConversationByChatAndClinicId(
    client: PrismaClientOrTx,
    { chatId, clinicId }: FindConversationByChatAndClinicIdType,
  ): Promise<WhatsAppConversation | null>;

  findAllByClinicId(
    client: PrismaClientOrTx,
    clinicId: string,
  ): Promise<WhatsAppConversation[]>;
}
