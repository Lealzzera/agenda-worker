import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import { IClinicRepository } from "../clinics/repositories/clinic-repository.interface";
import { IWhatsappConversationsRepository } from "./repositories/whatsapp-conversations-repository.interface";

type FindAllByClinicIdServiceResponse = {
  id: string;
  chatId: string;
  phoneNumber: string;
  aiEnabled: boolean;
};

export class FindAllByClinicIdService {
  constructor(
    private readonly clinicRepository: IClinicRepository,
    private readonly whatsappConversationsRepository: IWhatsappConversationsRepository,
  ) {}

  async exec(clinicId: string): Promise<FindAllByClinicIdServiceResponse[]> {
    const doesTheClinicExist = this.clinicRepository.findById(prisma, clinicId);

    if (!doesTheClinicExist) {
      throw new NotFoundError("Clinic provided does not exist.");
    }

    const conversationData =
      await this.whatsappConversationsRepository.findAllByClinicId(
        prisma,
        clinicId,
      );

    return conversationData.map((conversation) => ({
      id: conversation.id,
      chatId: conversation.chat_id,
      phoneNumber: conversation.phone_number,
      aiEnabled: conversation.ai_enabled,
    }));
  }
}
