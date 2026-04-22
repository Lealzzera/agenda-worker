import { ClinicServiceRepository } from "@/modules/clinic-service/repositories/clinic-service-repository";
import { ClinicSettingsRepository } from "@/modules/clinic-settings/repositories/clinic-settings-repository";
import { ClinicSpecialDateRepository } from "@/modules/clinic-special-date/repositories/clinic-special-date-repository";
import { ClinicWorkingHourRepository } from "@/modules/clinic-working-hour/repositories/clinic-working-hour-repository";
import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { WhatsAppSessionRepository } from "@/modules/whatsapp/repositories/whatsapp-session-repository";
import { WhatsAppAppointmentNotifier } from "@/modules/whatsapp/send-appointment-notification.service";
import { WhatsAppService } from "@/modules/whatsapp/whatsapp.service";
import { CreateAppointmentService } from "../create-appointment.service";
import { AppointmentRepository } from "../repositories/appointment-repository";

export function makeCreateAppointmentServiceFactory() {
  const appointmentRepository = new AppointmentRepository();
  const clinicRepository = new ClinicRepository();
  const clinicServiceRepository = new ClinicServiceRepository();
  const clinicSettingsRepository = new ClinicSettingsRepository();
  const clinicWorkingHourRepository = new ClinicWorkingHourRepository();
  const clinicSpecialDateRepository = new ClinicSpecialDateRepository();
  const whatsappSessionRepository = new WhatsAppSessionRepository();
  const whatsappService = new WhatsAppService();
  const appointmentNotifier = new WhatsAppAppointmentNotifier(
    whatsappSessionRepository,
    whatsappService,
  );

  const createAppointmentService = new CreateAppointmentService(
    appointmentRepository,
    clinicRepository,
    clinicServiceRepository,
    clinicSettingsRepository,
    clinicWorkingHourRepository,
    clinicSpecialDateRepository,
    appointmentNotifier,
  );

  return createAppointmentService;
}
