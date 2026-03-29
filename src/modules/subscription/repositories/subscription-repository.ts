import { Prisma, Subscription } from "@prisma/client";
import { ICreateSubscription, ISubscriptionRepository } from "./subscription-repository.interface";

export class SubscriptionRepository implements ISubscriptionRepository {
    async create(tx: Prisma.TransactionClient, { clinicId, planId, status, trialEndsAt, currentPeriodStart, currentPeriodEnd }: ICreateSubscription): Promise<Subscription> {
        const data = await tx.subscription.create({
            data: {
                clinic_id: clinicId,
                plan_id: planId,
                status,
                trial_ends_at: trialEndsAt,
                current_period_start: currentPeriodStart,
                current_period_end: currentPeriodEnd,
            }
        })
        return data;
    }
}