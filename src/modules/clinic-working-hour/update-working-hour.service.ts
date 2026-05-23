import { prisma } from "@/db/prisma";
import { BadRequestError } from "@/errors/bad-request.error";
import { NotFoundError } from "@/errors/not-found.error";
import { Weekday } from "@prisma/client";
import { IClinicRepository } from "../clinics/repositories/clinic-repository.interface";
import { IClinicWorkingHourRepository } from "./repositories/clinic-working-hour-repository.interface";

type WorkingHourInput = {
  weekday: Weekday;
  startTime: string;
  endTime: string;
};

type UpdateWorkingHourRequest = {
  clinicId: string;
  workingHours: WorkingHourInput[];
};

export class UpdateWorkingHourService {
  constructor(
    private readonly clinicRepository: IClinicRepository,
    private readonly clinicWorkingHourRepository: IClinicWorkingHourRepository,
  ) {}

  async exec({ clinicId, workingHours }: UpdateWorkingHourRequest) {
    const clinic = await this.clinicRepository.findById(prisma, clinicId);

    if (!clinic) {
      throw new NotFoundError("Clinic provided does not exist.");
    }

    for (const workingHour of workingHours) {
      if (workingHour.startTime >= workingHour.endTime) {
        throw new BadRequestError("Start time must be before end time.");
      }
    }

    await prisma.$transaction(async (transaction) => {
      await this.clinicWorkingHourRepository.deleteManyByClinicId(
        transaction,
        clinicId,
      );
      await this.clinicWorkingHourRepository.createMany(
        transaction,
        clinicId,
        workingHours,
      );
    });
  }
}
