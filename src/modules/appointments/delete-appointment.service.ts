import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import { IAppointmentRepository } from "./repositories/appointment-repository.interface";

interface IDeleteAppointmentRequest {
  appointmentId: string;
}

export class DeleteAppointmentService {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async exec({ appointmentId }: IDeleteAppointmentRequest): Promise<void> {
    const existingAppointment = await this.appointmentRepository.findById(
      prisma,
      appointmentId,
    );

    if (!existingAppointment) {
      throw new NotFoundError("Appointment not found");
    }

    await this.appointmentRepository.deleteById(prisma, appointmentId);
  }
}
