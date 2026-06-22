import { prisma } from "@/db/prisma";
import { BadRequestError } from "@/errors/bad-request.error";
import { NotFoundError } from "@/errors/not-found.error";
import { IClinicRepository } from "@/modules/clinics/repositories/clinic-repository.interface";
import { ICreateClinicSpecialDate } from "@/types/types";
import { IClinicSpecialDateRepository } from "./clinic-special-date-repository.interface";

export class CreateSpecialDateService {
  constructor(
    private readonly clinicRepository: IClinicRepository,
    private readonly clinicSpecialDateRepository: IClinicSpecialDateRepository,
  ) {}

  async exec({
    clinicId,
    specialDate,
    isOpen,
    periods,
    note,
  }: ICreateClinicSpecialDate) {
    const doesTheClinicExists = await this.clinicRepository.findById(
      prisma,
      clinicId,
    );

    if (!doesTheClinicExists) {
      throw new NotFoundError("Clinic provided does not exist.");
    }

    const [year, month, day] = specialDate.split("-").map(Number);

    const parsedDate = new Date(year, month - 1, day);

    const isValidDate =
      parsedDate.getFullYear() === year &&
      parsedDate.getMonth() === month - 1 &&
      parsedDate.getDate() === day;

    if (!isValidDate) {
      throw new BadRequestError("Invalid special date.");
    }

    const hasPeriods = periods && periods.length > 0;

    if (isOpen && !hasPeriods) {
      throw new BadRequestError(
        "At least one period is required when the clinic is open on a special date.",
      );
    }

    if (isOpen && hasPeriods) {
      for (const period of periods!) {
        const [startHour, startMinute] = period.startTime
          .split(":")
          .map(Number);

        const [endHour, endMinute] = period.endTime.split(":").map(Number);

        const isValidStartTime =
          startHour >= 0 &&
          startHour <= 23 &&
          startMinute >= 0 &&
          startMinute <= 59;

        const isValidEndTime =
          endHour >= 0 && endHour <= 23 && endMinute >= 0 && endMinute <= 59;

        if (!isValidStartTime) {
          throw new BadRequestError(`Invalid start time: ${period.startTime}`);
        }

        if (!isValidEndTime) {
          throw new BadRequestError(`Invalid end time: ${period.endTime}`);
        }

        const startTimeInMinutes = startHour * 60 + startMinute;

        const endTimeInMinutes = endHour * 60 + endMinute;

        if (endTimeInMinutes <= startTimeInMinutes) {
          throw new BadRequestError(
            `End time must be greater than start time. Period: ${period.startTime} - ${period.endTime}`,
          );
        }
      }

      const sortedPeriods = [...periods!].sort((a, b) => {
        const [aHour, aMinute] = a.startTime.split(":").map(Number);
        const [bHour, bMinute] = b.startTime.split(":").map(Number);

        return aHour * 60 + aMinute - (bHour * 60 + bMinute);
      });

      for (let i = 0; i < sortedPeriods.length - 1; i++) {
        const currentPeriod = sortedPeriods[i];
        const nextPeriod = sortedPeriods[i + 1];

        const [currentEndHour, currentEndMinute] = currentPeriod.endTime
          .split(":")
          .map(Number);

        const [nextStartHour, nextStartMinute] = nextPeriod.startTime
          .split(":")
          .map(Number);

        const currentEndInMinutes = currentEndHour * 60 + currentEndMinute;

        const nextStartInMinutes = nextStartHour * 60 + nextStartMinute;

        if (nextStartInMinutes < currentEndInMinutes) {
          throw new BadRequestError("Periods cannot overlap.");
        }
      }
    }

    const doesTheSpecialDateExist =
      await this.clinicSpecialDateRepository.findManyByClinicIdAndDate(
        prisma,
        clinicId,
        specialDate,
      );

    if (doesTheSpecialDateExist.length > 0) {
      throw new BadRequestError(
        "A special date is already configured for this date.",
      );
    }

    const createClinicSpecialDate =
      await this.clinicSpecialDateRepository.createMany(prisma, clinicId, {
        isOpen,
        periods,
        specialDate,
        note,
      });

    return createClinicSpecialDate;
  }
}
