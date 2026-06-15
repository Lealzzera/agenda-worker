import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import { IWhatsappConversationsRepository } from "./repositories/whatsapp-conversations-repository.interface";

interface IUpdateWhatsappConversationRequest {
  id: string;
  chatId: string;
  clinicId: string;
  aiEnabled: boolean;
}

export class UpdateWhatsappConversationService {
  constructor(
    private readonly whatsappConversationRepository: IWhatsappConversationsRepository,
  ) {}

  async exec({
    id,
    chatId,
    clinicId,
    aiEnabled,
  }: IUpdateWhatsappConversationRequest): Promise<void> {
    const doesTheConversationExist =
      await this.whatsappConversationRepository.findConversationByChatAndClinicId(
        prisma,
        { chatId, clinicId },
      );

    if (!doesTheConversationExist) {
      throw new NotFoundError("Conversation not found");
    }

    await this.whatsappConversationRepository.updateWhatsappConversations(
      prisma,
      {
        aiEnabled,
        id,
      },
    );
  }
}
