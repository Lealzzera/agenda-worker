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
    const draftSignUp = await client.signupDraft.upsert({
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
    return draftSignUp;
  }

  async findById(
    client: PrismaClientOrTx,
    id: string,
  ): Promise<SignupDraft | null> {
    const draftSignUp = await client.signupDraft.findUnique({ where: { id } });
    return draftSignUp;
  }

  async delete(client: PrismaClientOrTx, id: string): Promise<void> {
    await client.signupDraft.delete({ where: { id } });
  }

  async updateDraft(
    client: PrismaClientOrTx,
    id: string,
    data: any,
  ): Promise<SignupDraft> {
    const draftSignUp = await client.signupDraft.update({
      where: { id },
      data,
    });
    return draftSignUp;
  }
}
