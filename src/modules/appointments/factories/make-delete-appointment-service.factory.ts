import { DeleteAppointmentService } from "../delete-appointment.service";
import { AppointmentRepository } from "../repositories/appointment-repository";

export function makeDeleteAppointmentServiceFactory() {
  const appointmentRepository = new AppointmentRepository();

  const deleteAppointmentService = new DeleteAppointmentService(
    appointmentRepository,
  );

  return deleteAppointmentService;
}
