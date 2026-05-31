import { PrismaClientOrTx } from "@/types/prisma.type";
import { ClinicSettings } from "@prisma/client";

export interface CreateClinicSettings {
  clinicId: string;
  chargesEvaluation: boolean;
  evaluationPriceCents?: number | null;
  additionalInformation?: string | null;
}

export interface UpdateClinicSettings {
  chargesEvaluation?: boolean;
  evaluationPriceCents?: number | null;
  maxAppointmentsPerSlot?: number | null;
  appointmentDurationMinutes?: number | null;
  allowRescheduling?: boolean;
  allowCancellation?: boolean;
  aiAgentName?: string;
  additionalInformation?: string | null;
}

export interface IClinicSettingsRepository {
  create(
    client: PrismaClientOrTx,
    data: CreateClinicSettings,
  ): Promise<ClinicSettings>;
  findByClinicId(
    client: PrismaClientOrTx,
    clinicId: string,
  ): Promise<ClinicSettings | null>;
  update(
    client: PrismaClientOrTx,
    clinicId: string,
    data: UpdateClinicSettings,
  ): Promise<ClinicSettings>;
}
