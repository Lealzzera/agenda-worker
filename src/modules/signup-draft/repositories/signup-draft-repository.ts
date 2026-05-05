import { PrismaClientOrTx } from "@/types/prisma.type";
import { Prisma, SignupDraft } from "@prisma/client";
import {
  CreateSignupDraft,
  ISignupDraftRepository,
} from "./signup-draft-repository.interface";

export class SignupDraftRepository implements ISignupDraftRepository {
  async create(
    client: PrismaClientOrTx,
    {
      email,
      expiresAt,
      fullName,
      passwordHash,
      selectedPlanId,
      data,
      stripeCheckoutSessionId,
      status,
    }: CreateSignupDraft,
  ): Promise<SignupDraft> {
    return client.signupDraft.upsert({
      where: { email },
      create: {
        email,
        expires_at: expiresAt,
        full_name: fullName,
        password_hash: passwordHash,
        selected_plan_id: selectedPlanId,
        data: data as unknown as Prisma.JsonObject,
        stripe_checkout_session_id: stripeCheckoutSessionId ?? null,
        status: status ?? "PENDING",
      },
      update: {
        expires_at: expiresAt,
        full_name: fullName,
        password_hash: passwordHash,
        selected_plan_id: selectedPlanId,
        data: data as unknown as Prisma.JsonObject,
        stripe_checkout_session_id: stripeCheckoutSessionId ?? null,
        status: status ?? "PENDING",
      },
    });
  }

  async findById(
    client: PrismaClientOrTx,
    id: string,
  ): Promise<SignupDraft | null> {
    return client.signupDraft.findUnique({ where: { id } });
  }

  async findByStripeSessionId(
    client: PrismaClientOrTx,
    stripeSessionId: string,
  ): Promise<SignupDraft | null> {
    return client.signupDraft.findUnique({
      where: { stripe_checkout_session_id: stripeSessionId },
    });
  }

  async linkStripeSession(
    client: PrismaClientOrTx,
    draftId: string,
    stripeSessionId: string,
  ): Promise<void> {
    await client.signupDraft.update({
      where: { id: draftId },
      data: { stripe_checkout_session_id: stripeSessionId },
    });
  }
}
