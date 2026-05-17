import { PrismaClientOrTx } from "@/types/prisma.type";
import { Subscription, SubscriptionStatus } from "@prisma/client";

export interface ICreateSubscription {
  clinicId: string;
  planId: string;
  status: SubscriptionStatus;
  trialEndsAt?: Date;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  stripeCheckoutSessionId?: string;
  stripeSubscriptionId?: string;
}

export interface ISubscriptionRepository {
  create(
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
  ): Promise<Subscription>;
  findActiveByClinicId(
    client: PrismaClientOrTx,
    clinicId: string,
  ): Promise<Subscription | null>;
}
