import { PrismaClientOrTx } from "@/types/prisma.type";
import { ClinicSettings } from "@prisma/client";

export interface CreateClinicSettings {
  clinicId: string;
  chargesEvaluation: boolean;
  evaluationPriceCents?: number | null;
}

export interface IClinicSettingsRepository {
  create(
    client: PrismaClientOrTx,
    { clinicId, chargesEvaluation, evaluationPriceCents }: CreateClinicSettings,
  ): Promise<ClinicSettings>;
  findByClinicId(
    client: PrismaClientOrTx,
    clinicId: string,
  ): Promise<ClinicSettings | null>;
}
