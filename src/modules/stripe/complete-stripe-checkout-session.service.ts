import { prisma } from "@/db/prisma";
import { env } from "@/env";
import { BadRequestError } from "@/errors/bad-request.error";
import { ConflictError } from "@/errors/conflict.error";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { ISignupDraftRepository } from "@/modules/signup-draft/repositories/signup-draft-repository.interface";
import { ISubscriptionRepository } from "@/modules/subscription/repositories/subscription-repository.interface";
import Stripe from "stripe";
import makeRegisterUserClinicAccountServiceFactory from "./factories/make-register-user-clinic-account-service.factory";

type CompleteStripeCheckoutSessionServiceRequest = {
  sessionId: string;
};

type CompleteStripeCheckoutSessionServiceResponse = {
  accessToken: string;
  refreshToken: string;
};

export class CompleteStripeCheckoutSessionService {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly signupDraftRepository: ISignupDraftRepository,
  ) {}

  async exec({
    sessionId,
  }: CompleteStripeCheckoutSessionServiceRequest): Promise<CompleteStripeCheckoutSessionServiceResponse> {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.status !== "complete") {
      throw new ConflictError("Checkout session is not complete");
    }

    if (
      session.payment_status !== "paid" &&
      session.payment_status !== "no_payment_required"
    ) {
      throw new BadRequestError("Checkout session payment is not confirmed");
    }

    let user =
      await this.subscriptionRepository.findOwnerUserByStripeCheckoutSessionId(
        prisma,
        session.id,
      );

    if (!user) {
      const draftId = session.client_reference_id;

      if (!draftId) {
        throw new BadRequestError("Checkout session does not have a signup draft");
      }

      const draft = await this.signupDraftRepository.findById(prisma, draftId);

      if (!draft) {
        throw new ConflictError("Account not created by Stripe webhook yet");
      }

      if (draft.status !== "PENDING") {
        throw new ConflictError("Signup draft is not pending");
      }

      if (draft.stripe_checkout_session_id !== session.id) {
        throw new BadRequestError("Checkout session does not match signup draft");
      }

      const registerUserClinicAccountService =
        makeRegisterUserClinicAccountServiceFactory();

      await registerUserClinicAccountService.exec({
        draftId,
        stripeCheckoutSessionId: session.id,
        stripeCustomerId: String(session.customer ?? ""),
        stripeSubscriptionId: String(session.subscription ?? ""),
        lastStripeInvoiceId:
          typeof session.invoice === "string" ? session.invoice : null,
      });

      user =
        await this.subscriptionRepository.findOwnerUserByStripeCheckoutSessionId(
          prisma,
          session.id,
        );
    }

    if (!user) {
      throw new ConflictError("Account could not be created after checkout");
    }

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: "USER",
    });
    const refreshToken = signRefreshToken({ sub: user.id });

    return { accessToken, refreshToken };
  }
}
