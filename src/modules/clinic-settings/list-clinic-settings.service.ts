import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import { IClinicRepository } from "@/modules/clinics/repositories/clinic-repository.interface";
import { ClinicSettings } from "@prisma/client";
import { IClinicSettingsRepository } from "./repositories/clinic-settings-repository.interface";

interface IListClinicSettingsRequest {
  clinicId: string;
}

interface IListClinicSettingsResponse {
  clinicSettings: ClinicSettings;
}

export class ListClinicSettingsService {
  constructor(
    private readonly clinicRepository: IClinicRepository,
    private readonly clinicSettingsRepository: IClinicSettingsRepository,
  ) {}

  async exec({
    clinicId,
  }: IListClinicSettingsRequest): Promise<IListClinicSettingsResponse> {
    const doesTheClinicExists = await this.clinicRepository.findById(
      prisma,
      clinicId,
    );

    if (!doesTheClinicExists) {
      throw new NotFoundError("Clinic not found");
    }

    const clinicSettings =
      await this.clinicSettingsRepository.findByClinicId(prisma, clinicId);

    if (!clinicSettings) {
      throw new NotFoundError("Clinic settings not found for this clinic.");
    }

    return { clinicSettings };
  }
}
