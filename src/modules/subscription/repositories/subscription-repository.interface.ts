import { Prisma, Subscription, SubscriptionStatus } from "@prisma/client";

export interface ICreateSubscription {
    clinicId: string;
    planId: string;
    status: SubscriptionStatus;
    trialEndsAt?: Date;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
}

export interface ISubscriptionRepository {
    create(tx: Prisma.TransactionClient, {clinicId, planId, status, trialEndsAt, currentPeriodStart, currentPeriodEnd}: ICreateSubscription): Promise<Subscription>
}