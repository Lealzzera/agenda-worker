import { prisma } from "@/db/prisma";
import { getClinicSubscriptionAccess } from "@/modules/subscription/stripe-subscription-sync.service";
import { FastifyReply, FastifyRequest } from "fastify";

export async function requireActiveSubscription(req: FastifyRequest, res: FastifyReply) {
  const membership = await prisma.clinicMember.findFirst({
    where: { user_id: req.user.sub, status: "ACTIVE" },
    select: { clinic_id: true },
  });

  if (!membership) {
    return res.status(403).send({
      code: "CLINIC_ACCESS_DENIED",
      message: "No active clinic membership found.",
    });
  }

  const params = (req.params ?? {}) as {
    clinicId?: string;
    sessionName?: string;
  };
  const body = (req.body ?? {}) as {
    clinicId?: string;
    session?: string;
    sessionName?: string;
  };
  const requestedClinicId = params.clinicId ?? body.clinicId;
  const requestedSessionName =
    params.sessionName ?? body.sessionName ?? body.session;

  if (requestedClinicId && requestedClinicId !== membership.clinic_id) {
    return res.status(403).send({
      code: "CLINIC_ACCESS_DENIED",
      message: "The requested clinic does not belong to this user.",
    });
  }

  if (
    requestedSessionName &&
    requestedSessionName !== membership.clinic_id
  ) {
    return res.status(403).send({
      code: "WHATSAPP_SESSION_ACCESS_DENIED",
      message: "The requested WhatsApp session does not belong to this user.",
    });
  }

  const access = await getClinicSubscriptionAccess(membership.clinic_id);

  if (!access.allowed) {
    return res.status(402).send({
      code: "SUBSCRIPTION_REQUIRED",
      message: "An active subscription is required to use this feature.",
      subscriptionStatus: access.subscription?.status ?? null,
      trialEndsAt: access.subscription?.trial_ends_at ?? null,
    });
  }
}
