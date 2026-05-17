import { prisma } from "@/db/prisma";
import { BadRequestError } from "@/errors/bad-request.error";
import { NotFoundError } from "@/errors/not-found.error";
import { IClinicRepository } from "@/modules/clinics/repositories/clinic-repository.interface";
import { Appointments, AppointmentStatus } from "@prisma/client";
import { IAppointmentRepository } from "./repositories/appointment-repository.interface";

interface IListAppointmentsRequest {
  clinicId: string;
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
}

interface IListAppointmentsResponse {
  appointments: Appointments[];
}

export class ListAppointmentsService {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async exec({
    clinicId,
    status,
    startDate,
    endDate,
  }: IListAppointmentsRequest): Promise<IListAppointmentsResponse> {
    const doesTheClinicExists = await this.clinicRepository.findById(
      prisma,
      clinicId,
    );

    if (!doesTheClinicExists) {
      throw new NotFoundError("Clinic not found");
    }

    const parsedStartDate = startDate
      ? this.parseDateString(startDate, "startDate")
      : undefined;

    const parsedEndDate = endDate
      ? this.parseDateString(endDate, "endDate")
      : undefined;

    if (parsedStartDate && parsedEndDate && parsedEndDate < parsedStartDate) {
      throw new BadRequestError("endDate must be greater than or equal to startDate.");
    }

    const appointments = await this.appointmentRepository.findManyByClinicId(
      prisma,
      clinicId,
      {
        status,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      },
    );

    return { appointments };
  }

  private parseDateString(dateString: string, fieldName: string): Date {
    const [year, month, day] = dateString.split("-").map(Number);
    const parsedDate = new Date(year, month - 1, day);

    const isValidDate =
      parsedDate.getFullYear() === year &&
      parsedDate.getMonth() === month - 1 &&
      parsedDate.getDate() === day;

    if (!isValidDate) {
      throw new BadRequestError(`Invalid ${fieldName}. Expected YYYY-MM-DD.`);
    }

    return parsedDate;
  }
}
