import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import { IClinicRepository } from "@/modules/clinics/repositories/clinic-repository.interface";
import { ClinicType } from "@prisma/client";
import { IClinicSettingsRepository } from "./repositories/clinic-settings-repository.interface";

interface IListClinicSettingsRequest {
  clinicId: string;
}

interface IListClinicSettingsResponse {
  clinicName: string;
  clinicType: ClinicType;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  state: string | null;
  chargesEvaluation: boolean;
  evaluationPriceCents: number | null;
  maxAppointmentsPerSlot: number | null;
  appointmentDurationMinutes: number | null;
  allowRescheduling: boolean;
  allowCancellation: boolean;
  aiAgentName: string | null;
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

    const clinicSettings = await this.clinicSettingsRepository.findByClinicId(
      prisma,
      clinicId,
    );

    if (!clinicSettings) {
      throw new NotFoundError("Clinic settings not found for this clinic.");
    }

    return {
      clinicName: doesTheClinicExists.name,
      clinicType: doesTheClinicExists.type,
      address: doesTheClinicExists.address,
      postalCode: doesTheClinicExists.postal_code,
      city: doesTheClinicExists.city,
      state: doesTheClinicExists.state,
      chargesEvaluation: clinicSettings.charges_evaluation,
      evaluationPriceCents: clinicSettings.evaluation_price_cents,
      maxAppointmentsPerSlot: clinicSettings.max_appointments_per_slot,
      appointmentDurationMinutes: clinicSettings.appointment_duration_minutes,
      allowRescheduling: clinicSettings.allow_rescheduling,
      allowCancellation: clinicSettings.allow_cancellation,
      aiAgentName: clinicSettings.ai_agent_name,
    };
  }
}
