import { PrismaClientOrTx } from "@/types/prisma.type";
import { Subscription } from "@prisma/client";
import {
  ICreateSubscription,
  ISubscriptionRepository,
} from "./subscription-repository.interface";

export class SubscriptionRepository implements ISubscriptionRepository {
  async create(
    client: PrismaClientOrTx,
    {
      clinicId,
      planId,
      status,
      trialEndsAt,
      currentPeriodStart,
      currentPeriodEnd,
      stripeCheckoutSessionId,
      stripeSubscriptionId,
    }: ICreateSubscription,
  ): Promise<Subscription> {
    const data = await client.subscription.create({
      data: {
        clinic_id: clinicId,
        plan_id: planId,
        status,
        trial_ends_at: trialEndsAt,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        stripe_checkout_session_id: stripeCheckoutSessionId,
        stripe_subscription_id: stripeSubscriptionId,
      },
    });
    return data;
  }

  async findActiveByClinicId(
    client: PrismaClientOrTx,
    clinicId: string,
  ): Promise<Subscription | null> {
    const data = await client.subscription.findFirst({
      where: {
        clinic_id: clinicId,
        status: { in: ["ACTIVE", "TRIALING"] },
      },
    });

    return data || null;
  }
}
