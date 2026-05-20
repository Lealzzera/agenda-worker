import { env } from "@/env";
import { FastifyReply, FastifyRequest } from "fastify";
import crypto from "node:crypto";

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

  if (!req.body) return;

  switch (req.body.event) {
    case "session.status":
      console.log("Session status:", req.body);
      break;
  }

  return res.status(200).send({
    ok: true,
    message: "Webhook received",
    data: req.body,
  });
}
