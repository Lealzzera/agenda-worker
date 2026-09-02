import { prisma } from "@/db/prisma";
import { BadRequestError } from "@/errors/bad-request.error";
import { NotFoundError } from "@/errors/not-found.error";
import { IClinicRepository } from "@/modules/clinics/repositories/clinic-repository.interface";
import { Appointments, AppointmentStatus } from "@prisma/client";
import { IAppointmentRepository } from "./repositories/appointment-repository.interface";
import {
  clinicDateTimeToUtc,
  DEFAULT_CLINIC_TIME_ZONE,
} from "@/helpers/clinic-date-time";

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

    const clinicSettings = await prisma.clinicSettings.findUnique({
      where: { clinic_id: clinicId },
      select: { timezone: true },
    });
    const timeZone = clinicSettings?.timezone ?? DEFAULT_CLINIC_TIME_ZONE;

    const parsedStartDate = startDate
      ? this.parseDateString(startDate, "startDate", timeZone, false)
      : undefined;

    const parsedEndDate = endDate
      ? this.parseDateString(endDate, "endDate", timeZone, true)
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

  private parseDateString(
    dateString: string,
    fieldName: string,
    timeZone: string,
    endOfDay: boolean,
  ): Date {
    try {
      const parsedDate = clinicDateTimeToUtc(
        dateString,
        endOfDay ? "23:59:59" : "00:00:00",
        timeZone,
      );
      if (endOfDay) parsedDate.setUTCMilliseconds(999);
      return parsedDate;
    } catch {
      throw new BadRequestError(`Invalid ${fieldName}. Expected YYYY-MM-DD.`);
    }
  }
}
