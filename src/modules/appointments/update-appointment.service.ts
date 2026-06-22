import { prisma } from "@/db/prisma";
import { BadRequestError } from "@/errors/bad-request.error";
import { NotFoundError } from "@/errors/not-found.error";
import { IClinicSettingsRepository } from "@/modules/clinic-settings/repositories/clinic-settings-repository.interface";
import { IClinicSpecialDateRepository } from "@/modules/clinic-special-date/repositories/clinic-special-date-repository.interface";
import { IClinicWorkingHourRepository } from "@/modules/clinic-working-hour/repositories/clinic-working-hour-repository.interface";
import { WEEKDAY_BY_INDEX } from "@/types/types";
import { Appointments, AppointmentStatus } from "@prisma/client";
import { IAppointmentRepository } from "./repositories/appointment-repository.interface";

interface IUpdateAppointmentRequest {
  appointmentId: string;
  customerName?: string;
  customerPhoneNumber?: string;
  appointmentDate?: string;
  time?: string;
  notes?: string | null;
  status?: AppointmentStatus;
}

interface IUpdateAppointmentResponse {
  appointment: Appointments;
}

export class UpdateAppointmentService {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly clinicSettingsRepository: IClinicSettingsRepository,
    private readonly clinicWorkingHourRepository: IClinicWorkingHourRepository,
    private readonly clinicSpecialDateRepository: IClinicSpecialDateRepository,
  ) {}

  async exec({
    appointmentId,
    customerName,
    customerPhoneNumber,
    appointmentDate,
    time,
    notes,
    status,
  }: IUpdateAppointmentRequest): Promise<IUpdateAppointmentResponse> {
    const existingAppointment = await this.appointmentRepository.findById(
      prisma,
      appointmentId,
    );

    if (!existingAppointment) {
      throw new NotFoundError("Appointment not found");
    }

    const isReschedulingDateTime =
      appointmentDate !== undefined || time !== undefined;

    let rescheduledAppointmentDate: Date | undefined;

    if (isReschedulingDateTime) {
      const dateStringToParse =
        appointmentDate ??
        this.formatDateToYearMonthDay(existingAppointment.appointment_date);

      const timeStringToParse =
        time ?? this.formatTimeToHoursMinutes(existingAppointment.appointment_date);

      rescheduledAppointmentDate = this.buildAppointmentDate(
        dateStringToParse,
        timeStringToParse,
      );

      await this.assertRescheduleIsAllowed({
        clinicId: existingAppointment.clinic_id,
        rescheduledAppointmentDate,
        rescheduledAppointmentDateString: dateStringToParse,
        appointmentBeingUpdatedId: appointmentId,
      });
    }

    const updatedAppointment = await this.appointmentRepository.update(
      prisma,
      appointmentId,
      {
        customerName,
        customerPhoneNumber,
        notes,
        status,
        appointmentDate: rescheduledAppointmentDate,
      },
    );

    return { appointment: updatedAppointment };
  }

  private buildAppointmentDate(dateString: string, timeString: string): Date {
    const [year, month, day] = dateString.split("-").map(Number);
    const [hours, minutes] = timeString.split(":").map(Number);

    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  }

  private formatDateToYearMonthDay(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private formatTimeToHoursMinutes(date: Date): string {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  private async assertRescheduleIsAllowed({
    clinicId,
    rescheduledAppointmentDate,
    rescheduledAppointmentDateString,
    appointmentBeingUpdatedId,
  }: {
    clinicId: string;
    rescheduledAppointmentDate: Date;
    rescheduledAppointmentDateString: string;
    appointmentBeingUpdatedId: string;
  }): Promise<void> {
    const currentDateTime = new Date();

    if (rescheduledAppointmentDate < currentDateTime) {
      throw new BadRequestError(
        "Cannot reschedule an appointment to a past date",
      );
    }

    const weekDay =
      WEEKDAY_BY_INDEX[rescheduledAppointmentDate.getDay()];

    const clinicSpecialDate =
      await this.clinicSpecialDateRepository.findManyByClinicIdAndDate(
        prisma,
        clinicId,
        rescheduledAppointmentDateString,
      );

    const hasSpecialDate = clinicSpecialDate.length > 0;
    const specialDateNote = hasSpecialDate ? clinicSpecialDate[0].note : null;
    const isSpecialDateOpen = hasSpecialDate
      ? clinicSpecialDate[0].is_open
      : false;

    if (hasSpecialDate && !isSpecialDateOpen) {
      throw new BadRequestError(
        `Clinic will not operate on this day.${
          specialDateNote ? ` Reason: ${specialDateNote}` : ""
        }`,
      );
    }

    if (!hasSpecialDate) {
      const clinicWorkingHour =
        await this.clinicWorkingHourRepository.findByClinicIdAndWeekday(
          prisma,
          clinicId,
          weekDay,
        );

      if (!clinicWorkingHour.length) {
        throw new BadRequestError("Clinic does not work on this day.");
      }
    }

    const appointmentsAlreadyBookedCount =
      await this.appointmentRepository.countByClinicAndDate(
        prisma,
        clinicId,
        rescheduledAppointmentDate,
      );

    const existingAppointmentsAtSlot =
      await this.appointmentRepository.findManyByClinicId(prisma, clinicId, {
        startDate: rescheduledAppointmentDate,
        endDate: rescheduledAppointmentDate,
      });

    const isThisAppointmentAlreadyAtSlot = existingAppointmentsAtSlot.some(
      (appointment) =>
        appointment.id === appointmentBeingUpdatedId &&
        appointment.status !== AppointmentStatus.CANCELED_BY_CLINIC &&
        appointment.status !== AppointmentStatus.CANCELED_BY_PATIENT,
    );

    const effectiveBookedCount = isThisAppointmentAlreadyAtSlot
      ? appointmentsAlreadyBookedCount - 1
      : appointmentsAlreadyBookedCount;

    if (effectiveBookedCount > 0) {
      const clinicSettings = await this.clinicSettingsRepository.findByClinicId(
        prisma,
        clinicId,
      );

      const maxAppointmentsPerSlot =
        clinicSettings?.max_appointments_per_slot ?? 1;

      if (effectiveBookedCount >= maxAppointmentsPerSlot) {
        throw new BadRequestError(
          "There is already an appointment scheduled for this time.",
        );
      }
    }
  }
}
