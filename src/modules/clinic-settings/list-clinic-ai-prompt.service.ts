import { normalizeClinicAiPrompt } from "@/helpers/clinic-ai-prompt";
import { prisma } from "@/db/prisma";
import { IGlobalAiPromptRepository } from "./repositories/global-ai-prompt-repository.interface";

interface ListClinicAiPromptResponse {
  prompt: string;
}

export class ListClinicAiPromptService {
  constructor(
    private readonly globalAiPromptRepository: IGlobalAiPromptRepository,
  ) {}

  async exec(): Promise<ListClinicAiPromptResponse> {
    const prompt = await this.globalAiPromptRepository.find(prisma);
    return {
      prompt: normalizeClinicAiPrompt(prompt),
    };
  }
}
