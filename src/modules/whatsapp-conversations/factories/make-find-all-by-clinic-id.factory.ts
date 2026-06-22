import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { FindAllByClinicIdService } from "../find-all-by-clinic-id.service";
import { WhatsappConversationsRepository } from "../repositories/whatsapp-conversations-repository";

export default function makeFindAllByClinicIdFactory() {
  const clinicRepository = new ClinicRepository();
  const whatsappConversationRepository = new WhatsappConversationsRepository();
  const findAllByClinicIdService = new FindAllByClinicIdService(
    clinicRepository,
    whatsappConversationRepository,
  );

  return findAllByClinicIdService;
}
