import { PlanRepository } from "@/modules/plan/repositories/plan-repository";
import { SignupDraftRepository } from "@/modules/signup-draft/repositories/signup-draft-repository";
import { CreateStripeSessionService } from "../create-stripe-session.service";

export default function makeCreateStripeSessionService() {
  const signupDraftRepository = new SignupDraftRepository();
  const planRepository = new PlanRepository();
  const createStripeSessionService = new CreateStripeSessionService(
    signupDraftRepository,
    planRepository,
  );
  return createStripeSessionService;
}
