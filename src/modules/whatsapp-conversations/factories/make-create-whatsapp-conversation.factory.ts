import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { CreateWhatsappConversationService } from "../create-whatsapp-conversation.service";
import { WhatsappConversationsRepository } from "../repositories/whatsapp-conversations-repository";

export default function makeCreateWhatsappConversation() {
  const whatsappConversationRepository = new WhatsappConversationsRepository();
  const clinicRepository = new ClinicRepository();
  const createWhatsappConversationService =
    new CreateWhatsappConversationService(
      whatsappConversationRepository,
      clinicRepository,
    );
  return createWhatsappConversationService;
}
