import { GlobalAiPromptRepository } from "../repositories/global-ai-prompt-repository";
import { ListClinicAiPromptService } from "../list-clinic-ai-prompt.service";

export default function makeListClinicAiPromptServiceFactory() {
  return new ListClinicAiPromptService(new GlobalAiPromptRepository());
}
