import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { ClinicSettingsRepository } from "../repositories/clinic-settings-repository";
import { UpdateClinicAiPromptService } from "../update-clinic-ai-prompt.service";

export default function makeUpdateClinicAiPromptServiceFactory() {
  const clinicRepository = new ClinicRepository();
  const clinicSettingsRepository = new ClinicSettingsRepository();

  return new UpdateClinicAiPromptService(
    clinicRepository,
    clinicSettingsRepository,
  );
}
