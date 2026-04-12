import { WhatsAppService } from "../whatsapp.service";

export function makeWhatsAppServiceFactory() {
    return new WhatsAppService();
}
