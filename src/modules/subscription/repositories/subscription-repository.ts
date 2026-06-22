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
      lastStripeInvoiceId,
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
        last_stripe_invoice_id: lastStripeInvoiceId,
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

  async updateSubscription(
    client: PrismaClientOrTx,
    stripeSubscriptionId: string,
    data: Subscription,
  ): Promise<Subscription> {
    const updated = await client.subscription.update({
      where: {
        stripe_subscription_id: stripeSubscriptionId,
      },
      data,
    });
    return updated;
  }

  async findByStripeSubscriptionId(
    client: PrismaClientOrTx,
    stripeSubscriptionId: string,
  ): Promise<Subscription | null> {
    const data = await client.subscription.findUnique({
      where: {
        stripe_subscription_id: stripeSubscriptionId,
      },
    });
    return data || null;
  }

  async findOwnerUserByStripeCheckoutSessionId(
    client: PrismaClientOrTx,
    stripeCheckoutSessionId: string,
  ) {
    const subscription = await client.subscription.findUnique({
      where: {
        stripe_checkout_session_id: stripeCheckoutSessionId,
      },
      include: {
        clinic: {
          include: {
            members: {
              where: {
                role: "OWNER",
                status: "ACTIVE",
              },
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
              take: 1,
            },
          },
        },
      },
    });

    return subscription?.clinic.members[0]?.user ?? null;
  }
}
