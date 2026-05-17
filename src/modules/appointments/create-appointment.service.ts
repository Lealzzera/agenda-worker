import { prisma } from "@/db/prisma";
import { BadRequestError } from "@/errors/bad-request.error";
import { NotFoundError } from "@/errors/not-found.error";
import { IClinicSettingsRepository } from "@/modules/clinic-settings/repositories/clinic-settings-repository.interface";
import { IClinicSpecialDateRepository } from "@/modules/clinic-special-date/repositories/clinic-special-date-repository.interface";
import { IClinicWorkingHourRepository } from "@/modules/clinic-working-hour/repositories/clinic-working-hour-repository.interface";
import { IClinicRepository } from "@/modules/clinics/repositories/clinic-repository.interface";
import { WEEKDAY_BY_INDEX } from "@/types/types";
import { Appointments, AppointmentStatus } from "@prisma/client";
import { IAppointmentRepository } from "./repositories/appointment-repository.interface";

interface ICreateAppointmentRequest {
  clinicId: string;
  customerPhoneNumber: string;
  appointmentDate: string;
  time: string;
  notes?: string;
  status?: AppointmentStatus;
}

interface ICreateAppointmentResponse {
  appointment: Appointments;
}

export class CreateAppointmentService {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly clinicRepository: IClinicRepository,
    private readonly clinicSettingsRepository: IClinicSettingsRepository,
    private readonly clinicWorkingHourRepository: IClinicWorkingHourRepository,
    private readonly clinicSpecialDateRepository: IClinicSpecialDateRepository,
  ) {}

  async exec({
    clinicId,
    customerPhoneNumber,
    appointmentDate,
    time,
    notes,
    status,
  }: ICreateAppointmentRequest): Promise<ICreateAppointmentResponse> {
    const doesTheClinicExists = await this.clinicRepository.findById(
      prisma,
      clinicId,
    );

    if (!doesTheClinicExists) {
      throw new NotFoundError("Clinic not found");
    }

    const [year, month, day] = appointmentDate.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);

    const appointmentFormatted = new Date(
      year,
      month - 1,
      day,
      hours,
      minutes,
      0,
      0,
    );

    const currentDateTime = new Date();
    const weekDay = WEEKDAY_BY_INDEX[appointmentFormatted.getDay()];

    const isPastDate = appointmentFormatted < currentDateTime;

    if (isPastDate) {
      throw new BadRequestError("Cannot create an appointment in a past date");
    }

    const clinicSpecialDate =
      await this.clinicSpecialDateRepository.findManyByClinicIdAndDate(
        prisma,
        clinicId,
        appointmentDate,
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
        appointmentFormatted,
      );

    if (appointmentsAlreadyBookedCount > 0) {
      const clinicSettings = await this.clinicSettingsRepository.findByClinicId(
        prisma,
        clinicId,
      );

      const maxAppointmentsPerSlot =
        clinicSettings?.max_appointments_per_slot ?? 1;

      if (appointmentsAlreadyBookedCount >= maxAppointmentsPerSlot) {
        throw new BadRequestError(
          "There is already an appointment scheduled for this time.",
        );
      }
    }

    const appointment = await this.appointmentRepository.create(prisma, {
      clinicId,
      customerPhoneNumber,
      appointmentDate: appointmentFormatted,
      status: status ?? AppointmentStatus.PENDING,
      notes,
    });

    return { appointment };
  }
}
