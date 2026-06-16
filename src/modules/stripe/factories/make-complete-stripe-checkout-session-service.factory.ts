import { SubscriptionRepository } from "@/modules/subscription/repositories/subscription-repository";
import { CompleteStripeCheckoutSessionService } from "../complete-stripe-checkout-session.service";

export default function makeCompleteStripeCheckoutSessionService() {
  const subscriptionRepository = new SubscriptionRepository();
  const completeStripeCheckoutSessionService =
    new CompleteStripeCheckoutSessionService(subscriptionRepository);

  return completeStripeCheckoutSessionService;
}
