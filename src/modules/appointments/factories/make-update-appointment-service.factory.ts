import { ClinicSettingsRepository } from "@/modules/clinic-settings/repositories/clinic-settings-repository";
import { ClinicSpecialDateRepository } from "@/modules/clinic-special-date/repositories/clinic-special-date-repository";
import { ClinicWorkingHourRepository } from "@/modules/clinic-working-hour/repositories/clinic-working-hour-repository";
import { UpdateAppointmentService } from "../update-appointment.service";
import { AppointmentRepository } from "../repositories/appointment-repository";

export function makeUpdateAppointmentServiceFactory() {
  const appointmentRepository = new AppointmentRepository();
  const clinicSettingsRepository = new ClinicSettingsRepository();
  const clinicWorkingHourRepository = new ClinicWorkingHourRepository();
  const clinicSpecialDateRepository = new ClinicSpecialDateRepository();

  const updateAppointmentService = new UpdateAppointmentService(
    appointmentRepository,
    clinicSettingsRepository,
    clinicWorkingHourRepository,
    clinicSpecialDateRepository,
  );

  return updateAppointmentService;
}
