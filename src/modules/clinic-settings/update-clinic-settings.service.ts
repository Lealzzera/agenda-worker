import { prisma } from "@/db/prisma";
import { BadRequestError } from "@/errors/bad-request.error";
import { NotFoundError } from "@/errors/not-found.error";
import { IClinicRepository } from "@/modules/clinics/repositories/clinic-repository.interface";
import { ClinicSettings, ClinicType } from "@prisma/client";
import {
  IClinicSettingsRepository,
  UpdateClinicSettings,
} from "./repositories/clinic-settings-repository.interface";

interface IUpdateClinicSettingsRequest extends UpdateClinicSettings {
  clinicId: string;
  clinicName?: string;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  state?: string | null;
  clinicType?: ClinicType;
}

interface IUpdateClinicSettingsResponse {
  clinicSettings: ClinicSettings;
}

export class UpdateClinicSettingsService {
  constructor(
    private readonly clinicRepository: IClinicRepository,
    private readonly clinicSettingsRepository: IClinicSettingsRepository,
  ) {}

  async exec({
    clinicId,
    chargesEvaluation,
    evaluationPriceCents,
    maxAppointmentsPerSlot,
    appointmentDurationMinutes,
    allowRescheduling,
    allowCancellation,
    aiAgentName,
    clinicName,
    address,
    postalCode,
    city,
    state,
    clinicType,
  }: IUpdateClinicSettingsRequest): Promise<IUpdateClinicSettingsResponse> {
    const doesTheClinicExists = await this.clinicRepository.findById(
      prisma,
      clinicId,
    );

    if (!doesTheClinicExists) {
      throw new NotFoundError("Clinic not found");
    }

    const existingClinicSettings =
      await this.clinicSettingsRepository.findByClinicId(prisma, clinicId);

    if (!existingClinicSettings) {
      throw new NotFoundError("Clinic settings not found for this clinic.");
    }

    const hasClinicBasicDataToUpdate =
      clinicName !== undefined ||
      address !== undefined ||
      postalCode !== undefined ||
      city !== undefined ||
      state !== undefined ||
      clinicType !== undefined;

    if (
      clinicType !== undefined &&
      clinicType !== "DENTAL" &&
      clinicType !== "AESTHETIC" &&
      clinicType !== "MEDICAL" &&
      clinicType !== "OTHER" &&
      clinicType !== "PSYCHOLOGY"
    ) {
      throw new BadRequestError("Invalid clinic type");
    }

    if (hasClinicBasicDataToUpdate) {
      await this.clinicRepository.updateClinic(prisma, clinicId, {
        ...(clinicName !== undefined && { name: clinicName }),
        ...(address !== undefined && { address }),
        ...(postalCode !== undefined && { postal_code: postalCode }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
      });
    }

    const updatedClinicSettings = await this.clinicSettingsRepository.update(
      prisma,
      clinicId,
      {
        chargesEvaluation,
        evaluationPriceCents,
        maxAppointmentsPerSlot,
        appointmentDurationMinutes,
        allowRescheduling,
        allowCancellation,
        aiAgentName,
      },
    );

    return { clinicSettings: updatedClinicSettings };
  }
}
