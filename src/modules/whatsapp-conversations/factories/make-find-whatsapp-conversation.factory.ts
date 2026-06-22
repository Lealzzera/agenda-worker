import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { FindWhatsappConversationService } from "../find-whatsapp-conversation.service";
import { WhatsappConversationsRepository } from "../repositories/whatsapp-conversations-repository";

export default function makeFindWhatsappConversationFactory() {
  const clinicRepository = new ClinicRepository();
  const whatsappConversationRepository = new WhatsappConversationsRepository();
  const findWhatsappConversationService = new FindWhatsappConversationService(
    clinicRepository,
    whatsappConversationRepository,
  );
  return findWhatsappConversationService;
}
