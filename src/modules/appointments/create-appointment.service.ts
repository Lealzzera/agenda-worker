import { prisma } from "@/db/prisma";
import { BadRequestError } from "@/errors/bad-request.error";
import { ConflictError } from "@/errors/conflict.error";
import { NotFoundError } from "@/errors/not-found.error";
import { IClinicServiceRepository } from "@/modules/clinic-service/repositories/clinic-service-repository.interface";
import { IClinicSettingsRepository } from "@/modules/clinic-settings/repositories/clinic-settings-repository.interface";
import { IClinicSpecialDateRepository } from "@/modules/clinic-special-date/repositories/clinic-special-date-repository.interface";
import { IClinicWorkingHourRepository } from "@/modules/clinic-working-hour/repositories/clinic-working-hour-repository.interface";
import { IClinicRepository } from "@/modules/clinics/repositories/clinic-repository.interface";
import { IAppointmentNotifier } from "@/modules/whatsapp/send-appointment-notification.service";
import { Appointments, AppointmentStatus, Weekday } from "@prisma/client";
import { IAppointmentRepository } from "./repositories/appointment-repository.interface";

interface ICreateAppointmentRequest {
  clinicId: string;
  serviceId?: string;
  customerPhoneNumber: string;
  day: string;
  time: string;
  notes?: string;
  status?: AppointmentStatus;
}

interface ICreateAppointmentResponse {
  appointment: Appointments;
}

const WEEKDAY_BY_INDEX: Weekday[] = [
  Weekday.SUNDAY,
  Weekday.MONDAY,
  Weekday.TUESDAY,
  Weekday.WEDNESDAY,
  Weekday.THURSDAY,
  Weekday.FRIDAY,
  Weekday.SATURDAY,
];

export class CreateAppointmentService {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly clinicRepository: IClinicRepository,
    private readonly clinicServiceRepository: IClinicServiceRepository,
    private readonly clinicSettingsRepository: IClinicSettingsRepository,
    private readonly clinicWorkingHourRepository: IClinicWorkingHourRepository,
    private readonly clinicSpecialDateRepository: IClinicSpecialDateRepository,
    private readonly appointmentNotifier?: IAppointmentNotifier,
  ) {}

  async exec({
    clinicId,
    serviceId,
    customerPhoneNumber,
    day,
    time,
    notes,
    status,
  }: ICreateAppointmentRequest): Promise<ICreateAppointmentResponse> {
    const clinic = await this.clinicRepository.findById(prisma, clinicId);

    if (!clinic) {
      throw new NotFoundError("Clinic not found.");
    }

    if (serviceId) {
      const service = await this.clinicServiceRepository.findByIdAndClinicId(
        prisma,
        serviceId,
        clinicId,
      );

      if (!service) {
        throw new NotFoundError("Service not found for this clinic.");
      }
    }

    const { day: normalizedDay, time: normalizedTime } =
      this.validateDateTimeInputs(day, time);
    const appointmentDate = this.buildAppointmentDate(
      normalizedDay,
      normalizedTime,
    );

    await this.ensureSlotIsWithinOperatingHours(
      clinicId,
      normalizedDay,
      normalizedTime,
      appointmentDate,
    );

    await this.ensureSlotHasCapacity(clinicId, appointmentDate);

    const appointment = await this.appointmentRepository.create(prisma, {
      clinicId,
      serviceId,
      customerPhoneNumber,
      appointmentDate,
      status: status ?? AppointmentStatus.PENDING,
      notes,
    });

    if (this.appointmentNotifier) {
      const serviceName = serviceId
        ? (
            await this.clinicServiceRepository.findByIdAndClinicId(
              prisma,
              serviceId,
              clinicId,
            )
          )?.name
        : undefined;

      try {
        await this.appointmentNotifier.notifyAppointmentCreated({
          clinicId,
          clinicName: clinic.name,
          customerPhoneNumber,
          appointmentDate,
          serviceName,
          notes,
        });
      } catch (err) {
        console.error("Failed to send WhatsApp notification:", err);
      }
    }

    return { appointment };
  }

  private validateDateTimeInputs(
    day: string,
    time: string,
  ): { day: string; time: string } {
    const dayPattern = /^\d{4}-\d{2}-\d{2}$/;
    const timePattern = /^\d{2}:\d{2}(:\d{2})?$/;

    if (!dayPattern.test(day)) {
      throw new BadRequestError("Invalid day format. Expected YYYY-MM-DD.");
    }

    if (!timePattern.test(time)) {
      throw new BadRequestError(
        "Invalid time format. Expected HH:MM or HH:MM:SS.",
      );
    }

    const normalizedTime = time.length === 5 ? `${time}:00` : time;
    return { day, time: normalizedTime };
  }

  private buildAppointmentDate(day: string, time: string): Date {
    const appointmentDate = new Date(`${day}T${time}.000Z`);

    if (Number.isNaN(appointmentDate.getTime())) {
      throw new BadRequestError("Invalid appointment date.");
    }

    return appointmentDate;
  }

  private async ensureSlotIsWithinOperatingHours(
    clinicId: string,
    day: string,
    time: string,
    appointmentDate: Date,
  ): Promise<void> {
    const weekday = WEEKDAY_BY_INDEX[appointmentDate.getUTCDay()];

    const workingHours =
      await this.clinicWorkingHourRepository.findByClinicIdAndWeekday(
        prisma,
        clinicId,
        weekday,
      );

    const isWithinWorkingHours = workingHours.some((wh) =>
      this.isTimeWithinRange(time, wh.start_time, wh.end_time),
    );

    if (isWithinWorkingHours) {
      return;
    }

    const specialDate =
      await this.clinicSpecialDateRepository.findByClinicIdAndDate(
        prisma,
        clinicId,
        day,
      );

    if (
      specialDate &&
      specialDate.is_open &&
      specialDate.start_time &&
      specialDate.end_time &&
      this.isTimeWithinRange(time, specialDate.start_time, specialDate.end_time)
    ) {
      return;
    }

    throw new BadRequestError(
      "Appointment is outside of the clinic's operating hours.",
    );
  }

  private async ensureSlotHasCapacity(
    clinicId: string,
    appointmentDate: Date,
  ): Promise<void> {
    const existingCount = await this.appointmentRepository.countByClinicAndDate(
      prisma,
      clinicId,
      appointmentDate,
    );

    if (existingCount === 0) {
      return;
    }

    const settings = await this.clinicSettingsRepository.findByClinicId(
      prisma,
      clinicId,
    );

    const maxAppointmentsPerSlot = settings?.max_appointments_per_slot ?? 1;

    if (maxAppointmentsPerSlot <= 1) {
      throw new ConflictError(
        "This time slot already has an appointment for this clinic.",
      );
    }

    if (existingCount >= maxAppointmentsPerSlot) {
      throw new ConflictError(
        "This time slot has reached the maximum number of appointments.",
      );
    }
  }

  private isTimeWithinRange(
    time: string,
    startTime: string,
    endTime: string,
  ): boolean {
    const normalizedTime = this.normalizeTime(time);
    const normalizedStart = this.normalizeTime(startTime);
    const normalizedEnd = this.normalizeTime(endTime);

    return normalizedTime >= normalizedStart && normalizedTime < normalizedEnd;
  }

  private normalizeTime(time: string): string {
    if (/^\d{2}:\d{2}$/.test(time)) {
      return `${time}:00`;
    }
    return time;
  }
}
