import { ClinicServiceRepository } from "@/modules/clinic-service/repositories/clinic-service-repository";
import { ClinicSettingsRepository } from "@/modules/clinic-settings/repositories/clinic-settings-repository";
import { ClinicSpecialDateRepository } from "@/modules/clinic-special-date/repositories/clinic-special-date-repository";
import { ClinicWorkingHourRepository } from "@/modules/clinic-working-hour/repositories/clinic-working-hour-repository";
import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { CreateAppointmentService } from "../create-appointment.service";
import { AppointmentRepository } from "../repositories/appointment-repository";

export function makeCreateAppointmentServiceFactory() {
  const appointmentRepository = new AppointmentRepository();
  const clinicRepository = new ClinicRepository();
  const clinicServiceRepository = new ClinicServiceRepository();
  const clinicSettingsRepository = new ClinicSettingsRepository();
  const clinicWorkingHourRepository = new ClinicWorkingHourRepository();
  const clinicSpecialDateRepository = new ClinicSpecialDateRepository();

  const createAppointmentService = new CreateAppointmentService(
    appointmentRepository,
    clinicRepository,
    clinicServiceRepository,
    clinicSettingsRepository,
    clinicWorkingHourRepository,
    clinicSpecialDateRepository,
  );

  return createAppointmentService;
}
