import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import { IWhatsappConversationsRepository } from "./repositories/whatsapp-conversations-repository.interface";
import {
  clearAiConversationHistory,
  getAiConversationHistory,
} from "../ai/ai-conversation-memory";

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

    const conversation =
      await this.whatsappConversationRepository.updateWhatsappConversations(
        prisma,
        {
          aiEnabled,
          id,
        },
      );

    console.log(
      "Dentro do UPDATE ---->",
      getAiConversationHistory(`${clinicId}-${conversation.session}-${chatId}`),
    );

    clearAiConversationHistory(`${clinicId}-${conversation.session}-${chatId}`);
  }
}
