import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { DisconnectClinicWhatsAppSessionService } from "../disconnect-clinic-whatsapp-session.service";
import { GetClinicWhatsAppQrService } from "../get-clinic-whatsapp-qr.service";
import { GetClinicWhatsAppStatusService } from "../get-clinic-whatsapp-status.service";
import { ProcessWahaWebhookService } from "../process-waha-webhook.service";
import { WhatsAppSessionRepository } from "../repositories/whatsapp-session-repository";
import { StartClinicWhatsAppSessionService } from "../start-clinic-whatsapp-session.service";
import { StopClinicWhatsAppSessionService } from "../stop-clinic-whatsapp-session.service";
import { WhatsAppService } from "../whatsapp.service";

export function makeWhatsAppServiceFactory(): WhatsAppService {
  return new WhatsAppService();
}

export function makeStartClinicWhatsAppSessionServiceFactory() {
  return new StartClinicWhatsAppSessionService(
    new ClinicRepository(),
    new WhatsAppSessionRepository(),
    new WhatsAppService(),
  );
}

export function makeStopClinicWhatsAppSessionServiceFactory() {
  return new StopClinicWhatsAppSessionService(
    new WhatsAppSessionRepository(),
    new WhatsAppService(),
  );
}

export function makeDisconnectClinicWhatsAppSessionServiceFactory() {
  return new DisconnectClinicWhatsAppSessionService(
    new WhatsAppSessionRepository(),
    new WhatsAppService(),
  );
}

export function makeGetClinicWhatsAppQrServiceFactory() {
  return new GetClinicWhatsAppQrService(
    new ClinicRepository(),
    new WhatsAppSessionRepository(),
    new WhatsAppService(),
  );
}

export function makeGetClinicWhatsAppStatusServiceFactory() {
  return new GetClinicWhatsAppStatusService(
    new WhatsAppSessionRepository(),
    new WhatsAppService(),
  );
}

export function makeProcessWahaWebhookServiceFactory() {
  return new ProcessWahaWebhookService(new WhatsAppSessionRepository());
}
