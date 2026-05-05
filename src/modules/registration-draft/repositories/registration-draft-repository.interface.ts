import { RegistrationDraft } from "@prisma/client";
import { PrismaClientOrTx } from "@/types/prisma.type";

export interface IUpsertRegistrationDraft {
  email: string;
  payload: object;
  expiresAt: Date;
}

export interface IRegistrationDraftRepository {
  upsert(client: PrismaClientOrTx, data: IUpsertRegistrationDraft): Promise<RegistrationDraft>;
  findById(client: PrismaClientOrTx, id: string): Promise<RegistrationDraft | null>;
  findByStripeSessionId(client: PrismaClientOrTx, stripeSessionId: string): Promise<RegistrationDraft | null>;
  linkStripeSession(client: PrismaClientOrTx, draftId: string, stripeSessionId: string): Promise<void>;
  complete(client: PrismaClientOrTx, draftId: string, data: { userId: string; clinicId: string }): Promise<void>;
}
