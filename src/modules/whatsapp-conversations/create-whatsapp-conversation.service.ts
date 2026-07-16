import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import { WhatsAppConversation } from "@prisma/client";
import { IClinicRepository } from "../clinics/repositories/clinic-repository.interface";
import { IWhatsappConversationsRepository } from "./repositories/whatsapp-conversations-repository.interface";
import { clearAiConversationHistory } from "../ai/ai-conversation-memory";

interface ICreateWhatsappConversationRequest {
  chatId: string;
  clinicId: string;
  session: string;
  phoneNumber: string;
  aiEnabled: boolean;
}

export class CreateWhatsappConversationService {
  constructor(
    private readonly whatsappConversationRepository: IWhatsappConversationsRepository,
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async exec({
    clinicId,
    chatId,
    session,
    phoneNumber,
    aiEnabled,
  }: ICreateWhatsappConversationRequest): Promise<WhatsAppConversation> {
    const doesTheClinicExist = await this.clinicRepository.findById(
      prisma,
      clinicId,
    );
    if (!doesTheClinicExist) {
      throw new NotFoundError("Clinic not found");
    }

    const phoneNumberFormatted = phoneNumber.replace(/\D/g, "");

    clearAiConversationHistory(`${clinicId}-${session}-${chatId}`);

    const conversation =
      await this.whatsappConversationRepository.upsertWhatsappConversation(
        prisma,
        {
          aiEnabled,
          chatId,
          clinicId,
          phoneNumber: phoneNumberFormatted,
          session,
        },
      );

    return conversation;
  }
}
