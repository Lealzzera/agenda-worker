import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { ListWhatsappConversationsService } from "../list-whatsapp-conversations.service";
import { WhatsappConversationsRepository } from "../repositories/whatsapp-conversations-repository";

export default function makeListWhatsappConversationsFactory() {
  const clinicRepository = new ClinicRepository();
  const whatsappConversationRepository = new WhatsappConversationsRepository();
  const listWhatsappConversationsService =
    new ListWhatsappConversationsService(
      clinicRepository,
      whatsappConversationRepository,
    );

  return listWhatsappConversationsService;
}
