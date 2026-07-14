import { normalizeClinicAiPrompt } from "@/helpers/clinic-ai-prompt";
import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import { IClinicRepository } from "@/modules/clinics/repositories/clinic-repository.interface";
import { IClinicSettingsRepository } from "./repositories/clinic-settings-repository.interface";

interface UpdateClinicAiPromptRequest {
  clinicId: string;
  prompt: string;
}

interface UpdateClinicAiPromptResponse {
  prompt: string;
}

export class UpdateClinicAiPromptService {
  constructor(
    private readonly clinicRepository: IClinicRepository,
    private readonly clinicSettingsRepository: IClinicSettingsRepository,
  ) {}

  async exec({
    clinicId,
    prompt,
  }: UpdateClinicAiPromptRequest): Promise<UpdateClinicAiPromptResponse> {
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

    const normalizedPrompt = normalizeClinicAiPrompt(prompt);

    const updatedClinicSettings = await this.clinicSettingsRepository.update(
      prisma,
      clinicId,
      {
        aiCustomPrompt: normalizedPrompt,
      },
    );

    return {
      prompt: normalizeClinicAiPrompt(updatedClinicSettings.ai_custom_prompt),
    };
  }
}
