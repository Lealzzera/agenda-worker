import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import { IClinicRepository } from "@/modules/clinics/repositories/clinic-repository.interface";
import { IClinicSpecialDateRepository } from "./clinic-special-date-repository.interface";

interface IListSpecialDateRequest {
  clinicId: string;
}

interface ISpecialDatePeriod {
  startTime: string;
  endTime: string;
}

interface ISpecialDateGroup {
  date: string;
  isOpen: boolean;
  note: string | null;
  periods: ISpecialDatePeriod[];
}

interface IListSpecialDateResponse {
  specialDates: ISpecialDateGroup[];
}

export class ListSpecialDateService {
  constructor(
    private readonly clinicRepository: IClinicRepository,
    private readonly clinicSpecialDateRepository: IClinicSpecialDateRepository,
  ) {}

  async exec({
    clinicId,
  }: IListSpecialDateRequest): Promise<IListSpecialDateResponse> {
    const doesTheClinicExists = await this.clinicRepository.findById(
      prisma,
      clinicId,
    );

    if (!doesTheClinicExists) {
      throw new NotFoundError("Clinic provided does not exist.");
    }

    const specialDateRows =
      await this.clinicSpecialDateRepository.findManyByClinicId(
        prisma,
        clinicId,
      );

    const specialDatesGroupedByDate = new Map<string, ISpecialDateGroup>();

    for (const specialDateRow of specialDateRows) {
      const rowHasTimes =
        specialDateRow.start_time !== null && specialDateRow.end_time !== null;

      const existingGroup = specialDatesGroupedByDate.get(specialDateRow.date);

      if (!existingGroup) {
        specialDatesGroupedByDate.set(specialDateRow.date, {
          date: specialDateRow.date,
          isOpen: specialDateRow.is_open,
          note: specialDateRow.note,
          periods: rowHasTimes
            ? [
                {
                  startTime: specialDateRow.start_time as string,
                  endTime: specialDateRow.end_time as string,
                },
              ]
            : [],
        });
        continue;
      }

      if (rowHasTimes) {
        existingGroup.periods.push({
          startTime: specialDateRow.start_time as string,
          endTime: specialDateRow.end_time as string,
        });
      }
    }

    return {
      specialDates: Array.from(specialDatesGroupedByDate.values()),
    };
  }
}
