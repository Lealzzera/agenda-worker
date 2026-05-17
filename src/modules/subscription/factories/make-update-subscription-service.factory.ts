import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";
import { SubscriptionRepository } from "../repositories/subscription-repository";
import { UpdateSubscriptionService } from "../update-subscription.service";

export default function makeUpdateSubscriptionService() {
  const subscriptionRepository = new SubscriptionRepository();
  const clinicRepository = new ClinicRepository();
  const updateSubscriptionService = new UpdateSubscriptionService(
    subscriptionRepository,
    clinicRepository,
  );
  return updateSubscriptionService;
}
