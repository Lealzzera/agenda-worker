import { RegistrationDraft } from "@prisma/client";
import { PrismaClientOrTx } from "@/types/prisma.type";
import { IRegistrationDraftRepository, IUpsertRegistrationDraft } from "./registration-draft-repository.interface";

export class RegistrationDraftRepository implements IRegistrationDraftRepository {
  async upsert(
    client: PrismaClientOrTx,
    { email, payload, expiresAt }: IUpsertRegistrationDraft
  ): Promise<RegistrationDraft> {
    return client.registrationDraft.upsert({
      where: { email },
      update: {
        payload,
        expires_at: expiresAt,
        status: "PENDING",
        stripe_session_id: null,
      },
      create: {
        email,
        payload,
        expires_at: expiresAt,
        status: "PENDING",
      },
    });
  }

  async findById(
    client: PrismaClientOrTx,
    id: string
  ): Promise<RegistrationDraft | null> {
    return client.registrationDraft.findUnique({ where: { id } });
  }

  async findByStripeSessionId(
    client: PrismaClientOrTx,
    stripeSessionId: string
  ): Promise<RegistrationDraft | null> {
    return client.registrationDraft.findUnique({
      where: { stripe_session_id: stripeSessionId },
    });
  }

  async linkStripeSession(
    client: PrismaClientOrTx,
    draftId: string,
    stripeSessionId: string
  ): Promise<void> {
    await client.registrationDraft.update({
      where: { id: draftId },
      data: { stripe_session_id: stripeSessionId },
    });
  }

  async complete(
    client: PrismaClientOrTx,
    draftId: string,
    { userId, clinicId }: { userId: string; clinicId: string }
  ): Promise<void> {
    await client.registrationDraft.update({
      where: { id: draftId },
      data: {
        status: "COMPLETED",
        user_id: userId,
        clinic_id: clinicId,
        completed_at: new Date(),
      },
    });
  }
}
