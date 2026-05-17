import { prisma } from "@/db/prisma";
import { env } from "@/env";
import { NotFoundError } from "@/errors/not-found.error";
import Stripe from "stripe";
import { IPlanRepository } from "../plan/repositories/plan-repository.interface";
import { ISignupDraftRepository } from "../signup-draft/repositories/signup-draft-repository.interface";

type CreateStripeSessionServiceRequest = {
  priceId: string;
  uiMode: "embedded_page";
  quantity: number;
  mode: "subscription" | "payment";
  draftId: string;
};

export class CreateStripeSessionService {
  constructor(
    private readonly signupDraftRepository: ISignupDraftRepository,
    private readonly planRepository: IPlanRepository,
  ) {}

  async exec({
    draftId,
    priceId,
    uiMode,
    quantity,
    mode,
  }: CreateStripeSessionServiceRequest) {
    const draft = await this.signupDraftRepository.findById(prisma, draftId);

    if (!draft || draft.status !== "PENDING") {
      throw new NotFoundError("Signup draft not found or already completed.");
    }

    const plan = await this.planRepository.findPlanById(
      prisma,
      draft.selected_plan_id,
    );

    if (!plan) {
      throw new NotFoundError("Plan not found.");
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY);

    const stripeSession = await stripe.checkout.sessions.create({
      subscription_data: {
        ...(plan.trial_days > 0 && { trial_period_days: plan.trial_days }),
        metadata: { draftId },
      },
      client_reference_id: draftId,
      metadata: { draftId },
      customer_email: draft.email,
      ui_mode: uiMode,
      currency: "brl",
      line_items: [{ price: priceId, quantity }],
      mode,
      return_url: `${env.FRONTEND_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    await this.signupDraftRepository.updateDraft(prisma, draftId, {
      stripe_checkout_session_id: stripeSession.id,
    });

    return stripeSession;
  }
}
