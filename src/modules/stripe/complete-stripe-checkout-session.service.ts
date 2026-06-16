import { prisma } from "@/db/prisma";
import { env } from "@/env";
import { BadRequestError } from "@/errors/bad-request.error";
import { ConflictError } from "@/errors/conflict.error";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { ISubscriptionRepository } from "@/modules/subscription/repositories/subscription-repository.interface";
import Stripe from "stripe";

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

    const user =
      await this.subscriptionRepository.findOwnerUserByStripeCheckoutSessionId(
        prisma,
        session.id,
      );

    if (!user) {
      throw new ConflictError("Account not created by Stripe webhook yet");
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
