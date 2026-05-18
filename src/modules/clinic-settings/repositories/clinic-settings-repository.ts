import { PrismaClientOrTx } from "@/types/prisma.type";
import { ClinicSettings } from "@prisma/client";
import {
  CreateClinicSettings,
  IClinicSettingsRepository,
  UpdateClinicSettings,
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

  async update(
    client: PrismaClientOrTx,
    clinicId: string,
    data: UpdateClinicSettings,
  ): Promise<ClinicSettings> {
    const updatedClinicSettings = await client.clinicSettings.update({
      where: { clinic_id: clinicId },
      data: {
        ...(data.chargesEvaluation !== undefined && {
          charges_evaluation: data.chargesEvaluation,
        }),
        ...(data.evaluationPriceCents !== undefined && {
          evaluation_price_cents: data.evaluationPriceCents,
        }),
        ...(data.maxAppointmentsPerSlot !== undefined && {
          max_appointments_per_slot: data.maxAppointmentsPerSlot,
        }),
        ...(data.appointmentDurationMinutes !== undefined && {
          appointment_duration_minutes: data.appointmentDurationMinutes,
        }),
        ...(data.allowRescheduling !== undefined && {
          allow_rescheduling: data.allowRescheduling,
        }),
        ...(data.allowCancellation !== undefined && {
          allow_cancellation: data.allowCancellation,
        }),
        ...(data.aiAgentName !== undefined && {
          ai_agent_name: data.aiAgentName,
        }),
      },
    });
    return updatedClinicSettings;
  }
}
