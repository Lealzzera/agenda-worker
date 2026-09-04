import { normalizeClinicAiPrompt } from "@/helpers/clinic-ai-prompt";
import { prisma } from "@/db/prisma";
import { ForbiddenError } from "@/errors/forbidden.error";
import { IGlobalAiPromptRepository } from "./repositories/global-ai-prompt-repository.interface";

interface UpdateClinicAiPromptRequest {
  prompt: string;
  userRole: "ADMIN" | "USER";
}

interface UpdateClinicAiPromptResponse {
  prompt: string;
}

export class UpdateClinicAiPromptService {
  constructor(
    private readonly globalAiPromptRepository: IGlobalAiPromptRepository,
  ) {}

  async exec({
    prompt,
    userRole,
  }: UpdateClinicAiPromptRequest): Promise<UpdateClinicAiPromptResponse> {
    if (userRole !== "ADMIN") {
      throw new ForbiddenError("Only administrators can update the AI prompt");
    }

    const normalizedPrompt = normalizeClinicAiPrompt(prompt);
    const updatedPrompt = await this.globalAiPromptRepository.upsert(
      prisma,
      normalizedPrompt,
    );

    return {
      prompt: updatedPrompt,
    };
  }
}
