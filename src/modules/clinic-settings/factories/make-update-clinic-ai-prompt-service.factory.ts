import { GlobalAiPromptRepository } from "../repositories/global-ai-prompt-repository";
import { UpdateClinicAiPromptService } from "../update-clinic-ai-prompt.service";

export default function makeUpdateClinicAiPromptServiceFactory() {
  return new UpdateClinicAiPromptService(new GlobalAiPromptRepository());
}
