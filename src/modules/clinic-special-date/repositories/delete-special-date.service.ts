import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import { IClinicRepository } from "@/modules/clinics/repositories/clinic-repository.interface";
import { IClinicSpecialDateRepository } from "./clinic-special-date-repository.interface";

interface IDeleteSpecialDateRequest {
  clinicId: string;
  specialDate: string;
}

export class DeleteSpecialDateService {
  constructor(
    private readonly clinicRepository: IClinicRepository,
    private readonly clinicSpecialDateRepository: IClinicSpecialDateRepository,
  ) {}

  async exec({
    clinicId,
    specialDate,
  }: IDeleteSpecialDateRequest): Promise<void> {
    const doesTheClinicExists = await this.clinicRepository.findById(
      prisma,
      clinicId,
    );

    if (!doesTheClinicExists) {
      throw new NotFoundError("Clinic provided does not exist.");
    }

    const existingSpecialDateRows =
      await this.clinicSpecialDateRepository.findManyByClinicIdAndDate(
        prisma,
        clinicId,
        specialDate,
      );

    if (existingSpecialDateRows.length === 0) {
      throw new NotFoundError("Special date not found for this clinic.");
    }

    await this.clinicSpecialDateRepository.deleteManyByClinicIdAndDate(
      prisma,
      clinicId,
      specialDate,
    );
  }
}
