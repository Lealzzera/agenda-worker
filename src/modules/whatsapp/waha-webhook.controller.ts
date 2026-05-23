import { env } from "@/env";
import { WahaMessagePayload } from "@/types/types";
import { FastifyReply, FastifyRequest } from "fastify";
import crypto from "node:crypto";
import { broadcastToClinic } from "../realtime/realtime-broadcaster";

type WahaWebhookBody = {
  event?: string;
  metadata?: {
    clinicId?: string;
  };
  payload?: {
    clinicId?: string;
    metadata?: {
      clinicId?: string;
    };
  };
  session?: string;
};

async function resolveClinicIdFromWebhook(body: WahaWebhookBody) {
  const clinicId =
    body.metadata?.clinicId ??
    body.payload?.metadata?.clinicId ??
    body.payload?.clinicId;

  if (clinicId) {
    return clinicId;
  }

  if (!body.session) {
    return null;
  }
}

function formatMessagePayload(payload: WahaMessagePayload) {
  return {
    eventId: payload.id,
    event: payload.event,
    session: payload.session,
    messageData: {
      messageBody: payload.payload.body,
      fromMe: payload.payload.fromMe,
    },
  };
}

export async function wahaWebhookController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const signature = req.headers["x-webhook-hmac"] as string;
  const algorithm = req.headers["x-webhook-hmac-algorithm"] as string;

  if (!signature || !algorithm) {
    return res.status(401).send({
      message: "Missing webhook signature",
    });
  }

  const rawBody = JSON.stringify(req.body);

  const calculatedHmac = crypto
    .createHmac(algorithm, env.WAHA_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (signature.length !== calculatedHmac.length) {
    console.log("Invalid webhook signature");
    return res.status(401).send({
      message: "Invalid webhook signature",
    });
  }

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedHmac),
  );

  if (!isValid) {
    console.log("Invalid webhook signature");
    return res.status(401).send({
      message: "Invalid webhook signature",
    });
  }

  if (!req.body) {
    return res.status(400).send({
      message: "Missing webhook body",
    });
  }

  const body = req.body as WahaWebhookBody;
  const clinicId = await resolveClinicIdFromWebhook(body);

  if (clinicId) {
    switch (body.event) {
      case "session.status":
        broadcastToClinic(clinicId, {
          event: "sesion_status",
          payload: body,
        });
        break;
      case "message.any":
        const messageInfo = formatMessagePayload(
          body as unknown as WahaMessagePayload,
        );
        broadcastToClinic(clinicId, {
          event: "message_any",
          payload: messageInfo,
        });
        break;
      case "message.ack":
        broadcastToClinic(clinicId, {
          event: "message_ack",
          payload: body,
        });
        break;
      case "message.reaction":
        broadcastToClinic(clinicId, {
          event: "message_reaction",
          payload: body,
        });
        break;
      case "presence.update":
        broadcastToClinic(clinicId, {
          event: "presence_update",
          payload: body,
        });
        break;
      case "message.waiting":
        broadcastToClinic(clinicId, {
          event: "message_waiting",
          payload: body,
        });
        break;
      default:
        console.log("WAHA webhook event not handled:", body.event);
        break;
    }
  } else {
    console.log("WAHA webhook without clinic id:", body);
  }

  return res.status(200).send({
    ok: true,
    message: "Webhook received",
    data: body,
  });
}
