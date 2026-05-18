import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import { IClinicRepository } from "../clinics/repositories/clinic-repository.interface";
import { IClinicWorkingHourRepository } from "./repositories/clinic-working-hour-repository.interface";

export class ListAllWorkingHourService {
  constructor(
    private readonly clinicRepository: IClinicRepository,
    private readonly clinicWorkingHourRepository: IClinicWorkingHourRepository,
  ) {}

  async exec(clinicId: string) {
    if (!clinicId.length) {
      throw new NotFoundError("Clinic ID is required.");
    }
    const doesClinicExist = await this.clinicRepository.findById(
      prisma,
      clinicId,
    );
    if (!doesClinicExist) {
      throw new NotFoundError("Clinic provided does not exist.");
    }

    const workingHours =
      await this.clinicWorkingHourRepository.findAllByClinicId(
        prisma,
        clinicId,
      );
    return { clinicWorkingHour: workingHours };
  }
}
