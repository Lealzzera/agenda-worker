import { PrismaClientOrTx } from "@/types/prisma.type";
import { ClinicSettings } from "@prisma/client";
import {
  CreateClinicSettings,
  IClinicSettingsRepository,
} from "./clinic-settings-repository.interface";

export class ClinicSettingsRepository implements IClinicSettingsRepository {
  async create(
    client: PrismaClientOrTx,
    { clinicId, chargesEvaluation, evaluationPriceCents }: CreateClinicSettings,
  ): Promise<ClinicSettings> {
    const clinicSettings = await client.clinicSettings.create({
      data: {
        clinic_id: clinicId,
        charges_evaluation: chargesEvaluation,
        evaluation_price_cents: evaluationPriceCents,
      },
    });
    return clinicSettings;
  }

  async findByClinicId(
    client: PrismaClientOrTx,
    clinicId: string,
  ): Promise<ClinicSettings | null> {
    const clinicSettings = await client.clinicSettings.findUnique({
      where: {
        clinic_id: clinicId,
      },
    });
    return clinicSettings;
  }
}
