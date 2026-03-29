import { Prisma, Subscription, SubscriptionStatus } from "@prisma/client";
import { PrismaClientOrTx } from "@/types/prisma.type";

export interface ICreateSubscription {
    clinicId: string;
    planId: string;
    status: SubscriptionStatus;
    trialEndsAt?: Date;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
}

export interface ISubscriptionRepository {
    create(client: PrismaClientOrTx, {clinicId, planId, status, trialEndsAt, currentPeriodStart, currentPeriodEnd}: ICreateSubscription): Promise<Subscription>
    findActiveByClinicId(client: PrismaClientOrTx, clinicId: string): Promise<Subscription | null>
}