import { PrismaClientOrTx } from "@/types/prisma.type";

export interface IGlobalAiPromptRepository {
  find(client: PrismaClientOrTx): Promise<string | null>;
  upsert(client: PrismaClientOrTx, prompt: string): Promise<string>;
}
