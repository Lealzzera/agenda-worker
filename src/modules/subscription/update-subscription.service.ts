import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import { ClinicStatus, SubscriptionStatus } from "@prisma/client";
import { IClinicRepository } from "../clinics/repositories/clinic-repository.interface";
import { ISubscriptionRepository } from "./repositories/subscription-repository.interface";

type UpdateSubscriptionServiceRequest = {
  currentPeriodStart?: number;
  currentPeriodEnd?: number;
  lastStripeInvoiceId: string;
  stripeSubscriptionId: string;
  subscriptionStatus: SubscriptionStatus;
  clinicStatus: ClinicStatus;
};

export class UpdateSubscriptionService {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly clinicRepository: IClinicRepository,
  ) {}

  async exec({
    currentPeriodStart,
    currentPeriodEnd,
    lastStripeInvoiceId,
    stripeSubscriptionId,
    subscriptionStatus,
    clinicStatus,
  }: UpdateSubscriptionServiceRequest) {
    const subscription =
      await this.subscriptionRepository.findByStripeSubscriptionId(
        prisma,
        stripeSubscriptionId,
      );

    if (!subscription) {
      throw new NotFoundError("Subscription not found");
    }

    await prisma.$transaction(async (tx) => {
      await this.subscriptionRepository.updateSubscription(
        tx,
        stripeSubscriptionId,
        {
          current_period_start: currentPeriodStart
            ? new Date(currentPeriodStart * 1000)
            : undefined,
          current_period_end: currentPeriodEnd
            ? new Date(currentPeriodEnd * 1000)
            : undefined,
          last_stripe_invoice_id: lastStripeInvoiceId,
          status: subscriptionStatus,
          cancel_at_period_end: subscriptionStatus === "CANCELED",
        },
      );
      await this.clinicRepository.updateClinic(tx, subscription.clinic_id, {
        status: clinicStatus,
      });
    });
  }
}
