import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import { IClinicRepository } from "../clinics/repositories/clinic-repository.interface";
import { IWhatsappConversationsRepository } from "./repositories/whatsapp-conversations-repository.interface";

interface IFindWhatsappConversationRequest {
  chatId: string;
  clinicId: string;
}

interface IFindWhatsappConversationResponse {
  id: string;
  chatId: string;
  clinicId: string;
  aiEnabled: boolean;
}

export class FindWhatsappConversationService {
  constructor(
    private readonly clinicRepository: IClinicRepository,
    private readonly whatsappConversationRepository: IWhatsappConversationsRepository,
  ) {}

  async exec({
    chatId,
    clinicId,
  }: IFindWhatsappConversationRequest): Promise<IFindWhatsappConversationResponse | null> {
    const doesTheClinicExist = await this.clinicRepository.findById(
      prisma,
      clinicId,
    );
    if (!doesTheClinicExist) {
      throw new NotFoundError("Clinic not found");
    }

    const conversation =
      await this.whatsappConversationRepository.findConversationByChatAndClinicId(
        prisma,
        { chatId, clinicId },
      );

    return conversation
      ? {
          id: conversation.id,
          chatId: conversation.chat_id,
          clinicId: conversation.clinic_id,
          aiEnabled: conversation.ai_enabled,
        }
      : null;
  }
}
