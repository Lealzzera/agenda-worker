import { PrismaClientOrTx } from "@/types/prisma.type";
import { IGlobalAiPromptRepository } from "./global-ai-prompt-repository.interface";

type GlobalAiPromptRow = {
  prompt: string;
};

export class GlobalAiPromptRepository implements IGlobalAiPromptRepository {
  async find(client: PrismaClientOrTx): Promise<string | null> {
    const rows = await client.$queryRaw<GlobalAiPromptRow[]>`
      SELECT "prompt"
      FROM "global_ai_prompt"
      LIMIT 1
    `;

    return rows[0]?.prompt ?? null;
  }

  async upsert(client: PrismaClientOrTx, prompt: string): Promise<string> {
    const rows = await client.$queryRaw<GlobalAiPromptRow[]>`
      INSERT INTO "global_ai_prompt" ("prompt")
      VALUES (${prompt})
      ON CONFLICT ((true)) DO UPDATE
      SET "prompt" = EXCLUDED."prompt"
      RETURNING "prompt"
    `;

    return rows[0].prompt;
  }
}
