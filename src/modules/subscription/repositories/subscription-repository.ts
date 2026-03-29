import { Subscription } from "@prisma/client";
import { ICreateSubscription, ISubscriptionRepository } from "./subscription-repository.interface";
import { PrismaClientOrTx } from "@/types/prisma.type";

export class SubscriptionRepository implements ISubscriptionRepository {
    async create(client: PrismaClientOrTx, { clinicId, planId, status, trialEndsAt, currentPeriodStart, currentPeriodEnd }: ICreateSubscription): Promise<Subscription> {
        const data = await client.subscription.create({
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

    async findActiveByClinicId(client: PrismaClientOrTx, clinicId: string): Promise<Subscription | null> {
        const data = await client.subscription.findFirst({
            where: {
                clinic_id: clinicId,
                status: { in: ['ACTIVE', 'TRIALING'] }
            }
        })

        return data || null;
    }
}