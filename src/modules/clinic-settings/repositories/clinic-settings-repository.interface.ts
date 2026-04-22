import { PrismaClientOrTx } from "@/types/prisma.type";
import { ClinicSettings } from "@prisma/client";

export interface CreateClinicSettings {
  clinicId: string
  chargesEvaluation: boolean
  evaluationPriceCents?: number | null
  maxAppointmentsPerSlot?: number | null
  appointmentDurationMinutes?: number | null
  allowRescheduling?: boolean
  allowCancellation?: boolean
  timezone?: string
  aiAgentName?: string
}

export interface IClinicSettingsRepository {
    create(client: PrismaClientOrTx, { clinicId, chargesEvaluation, evaluationPriceCents, maxAppointmentsPerSlot, appointmentDurationMinutes, allowRescheduling, allowCancellation, timezone, aiAgentName }: CreateClinicSettings): Promise<ClinicSettings>
    findByClinicId(client: PrismaClientOrTx, clinicId: string): Promise<ClinicSettings | null>
}