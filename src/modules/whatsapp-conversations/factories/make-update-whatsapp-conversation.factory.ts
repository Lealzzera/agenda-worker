import { UpdateWhatsappConversationService } from "../update-whatsapp-conversation.service";
import { WhatsappConversationsRepository } from "../repositories/whatsapp-conversations-repository";

export default function makeUpdateWhatsappConversationFactory() {
  const whatsappConversationRepository = new WhatsappConversationsRepository();
  const updateWhatsappConversationService =
    new UpdateWhatsappConversationService(whatsappConversationRepository);

  return updateWhatsappConversationService;
}
