import { prisma } from "@/db/prisma";
import { env } from "@/env";
import { Subscription, SubscriptionStatus } from "@prisma/client";
import Stripe from "stripe";

const STRIPE_STATUS_CACHE_MS = 10 * 60 * 1000;

const stripeStatusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
  active: "ACTIVE",
  trialing: "TRIALING",
  past_due: "PAST_DUE",
  canceled: "CANCELED",
  incomplete: "INCOMPLETE",
  incomplete_expired: "INCOMPLETE_EXPIRED",
  unpaid: "UNPAID",
  paused: "PAUSED",
};

function asDate(timestamp: number | null | undefined) {
  return timestamp ? new Date(timestamp * 1000) : null;
}

function getLatestInvoiceId(subscription: Stripe.Subscription) {
  if (typeof subscription.latest_invoice === "string") {
    return subscription.latest_invoice;
  }

  return subscription.latest_invoice?.id ?? undefined;
}

export function subscriptionAllowsAccess(
  subscription: Pick<Subscription, "status" | "trial_ends_at">,
  now = new Date(),
) {
  if (subscription.status === "ACTIVE") return true;

  return (
    subscription.status === "TRIALING" &&
    !!subscription.trial_ends_at &&
    subscription.trial_ends_at.getTime() > now.getTime()
  );
}

export async function syncSubscriptionFromStripe(
  stripeSubscription: Stripe.Subscription,
) {
  const localSubscription = await prisma.subscription.findUnique({
    where: { stripe_subscription_id: stripeSubscription.id },
  });

  if (!localSubscription) return null;

  const status = stripeStatusMap[stripeSubscription.status];
  const clinicStatus = subscriptionAllowsAccess({
    status,
    trial_ends_at: asDate(stripeSubscription.trial_end),
  })
    ? "ACTIVE"
    : "SUSPENDED";

  return prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.update({
      where: { id: localSubscription.id },
      data: {
        status,
        trial_ends_at: asDate(stripeSubscription.trial_end),
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        last_stripe_invoice_id: getLatestInvoiceId(stripeSubscription),
        stripe_status_checked_at: new Date(),
      },
    });

    await tx.clinic.update({
      where: { id: localSubscription.clinic_id },
      data: { status: clinicStatus },
    });

    return subscription;
  });
}

export async function reconcileSubscriptionIfStale(
  subscription: Subscription,
  force = false,
) {
  if (!subscription.stripe_subscription_id) return subscription;

  const checkedAt = subscription.stripe_status_checked_at?.getTime() ?? 0;
  const isFresh = Date.now() - checkedAt < STRIPE_STATUS_CACHE_MS;

  if (!force && isFresh) return subscription;

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscription.stripe_subscription_id,
  );

  return (await syncSubscriptionFromStripe(stripeSubscription)) ?? subscription;
}

export async function getClinicSubscriptionAccess(
  clinicId: string,
  options: { reconcile?: boolean } = {},
) {
  let subscription = await prisma.subscription.findFirst({
    where: { clinic_id: clinicId },
    orderBy: { created_at: "desc" },
  });

  if (!subscription) {
    return { allowed: false, subscription: null };
  }

  if (options.reconcile !== false) {
    try {
      subscription = await reconcileSubscriptionIfStale(subscription);
    } catch (error) {
      console.error("Failed to reconcile subscription with Stripe", {
        clinicId,
        stripeSubscriptionId: subscription.stripe_subscription_id,
        error,
      });
    }
  }

  return {
    allowed: subscriptionAllowsAccess(subscription),
    subscription,
  };
}
