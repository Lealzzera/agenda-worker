import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import { WhatsAppConversation } from "@prisma/client";
import { IClinicRepository } from "../clinics/repositories/clinic-repository.interface";
import { IWhatsappConversationsRepository } from "./repositories/whatsapp-conversations-repository.interface";

interface IListWhatsappConversationsRequest {
  clinicId: string;
}

interface IListWhatsappConversationsResponse {
  conversations: WhatsAppConversation[];
}

export class ListWhatsappConversationsService {
  constructor(
    private readonly clinicRepository: IClinicRepository,
    private readonly whatsappConversationRepository: IWhatsappConversationsRepository,
  ) {}

  async exec({
    clinicId,
  }: IListWhatsappConversationsRequest): Promise<IListWhatsappConversationsResponse> {
    const doesTheClinicExist = await this.clinicRepository.findById(
      prisma,
      clinicId,
    );

    if (!doesTheClinicExist) {
      throw new NotFoundError("Clinic not found");
    }

    const conversations =
      await this.whatsappConversationRepository.findAllByClinicId(
        prisma,
        clinicId,
      );

    return { conversations };
  }
}
