import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { ClinicSettingsRepository } from "../repositories/clinic-settings-repository";
import { ListClinicAiPromptService } from "../list-clinic-ai-prompt.service";

export default function makeListClinicAiPromptServiceFactory() {
  const clinicRepository = new ClinicRepository();
  const clinicSettingsRepository = new ClinicSettingsRepository();

  return new ListClinicAiPromptService(
    clinicRepository,
    clinicSettingsRepository,
  );
}
