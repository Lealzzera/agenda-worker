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
  lastStripeInvoiceId?: string;
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
      lastStripeInvoiceId,
    }: ICreateSubscription,
  ): Promise<Subscription>;
  findActiveByClinicId(
    client: PrismaClientOrTx,
    clinicId: string,
  ): Promise<Subscription | null>;
  updateSubscription(
    client: PrismaClientOrTx,
    stripeSubscriptionId: string,
    data: Partial<Subscription>,
  ): Promise<Subscription>;
  findByStripeSubscriptionId(
    client: PrismaClientOrTx,
    stripeSubscriptionId: string,
  ): Promise<Subscription | null>;
  findOwnerUserByStripeCheckoutSessionId(
    client: PrismaClientOrTx,
    stripeCheckoutSessionId: string,
  ): Promise<{
    id: string;
    email: string;
  } | null>;
}
