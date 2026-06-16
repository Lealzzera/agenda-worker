import { SignupDraftRepository } from "@/modules/signup-draft/repositories/signup-draft-repository";
import { SubscriptionRepository } from "@/modules/subscription/repositories/subscription-repository";
import { CompleteStripeCheckoutSessionService } from "../complete-stripe-checkout-session.service";

export default function makeCompleteStripeCheckoutSessionService() {
  const subscriptionRepository = new SubscriptionRepository();
  const signupDraftRepository = new SignupDraftRepository();
  const completeStripeCheckoutSessionService =
    new CompleteStripeCheckoutSessionService(
      subscriptionRepository,
      signupDraftRepository,
    );

  return completeStripeCheckoutSessionService;
}
