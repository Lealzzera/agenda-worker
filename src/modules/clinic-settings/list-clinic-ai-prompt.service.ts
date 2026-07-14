import { normalizeClinicAiPrompt } from "@/helpers/clinic-ai-prompt";
import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import { IClinicRepository } from "@/modules/clinics/repositories/clinic-repository.interface";
import { IClinicSettingsRepository } from "./repositories/clinic-settings-repository.interface";

interface ListClinicAiPromptRequest {
  clinicId: string;
}

interface ListClinicAiPromptResponse {
  prompt: string;
}

export class ListClinicAiPromptService {
  constructor(
    private readonly clinicRepository: IClinicRepository,
    private readonly clinicSettingsRepository: IClinicSettingsRepository,
  ) {}

  async exec({
    clinicId,
  }: ListClinicAiPromptRequest): Promise<ListClinicAiPromptResponse> {
    const clinic = await this.clinicRepository.findById(prisma, clinicId);

    if (!clinic) {
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
      prompt: normalizeClinicAiPrompt(clinicSettings.ai_custom_prompt),
    };
  }
}
