import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { ListAppointmentsService } from "../list-appointments.service";
import { AppointmentRepository } from "../repositories/appointment-repository";

export function makeListAppointmentsServiceFactory() {
  const appointmentRepository = new AppointmentRepository();
  const clinicRepository = new ClinicRepository();

  const listAppointmentsService = new ListAppointmentsService(
    appointmentRepository,
    clinicRepository,
  );

  return listAppointmentsService;
}
