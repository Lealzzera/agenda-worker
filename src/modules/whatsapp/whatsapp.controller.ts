import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import {
  makeDisconnectClinicWhatsAppSessionServiceFactory,
  makeGetClinicWhatsAppQrServiceFactory,
  makeGetClinicWhatsAppStatusServiceFactory,
  makeProcessWahaWebhookServiceFactory,
  makeStartClinicWhatsAppSessionServiceFactory,
  makeStopClinicWhatsAppSessionServiceFactory,
} from "./factories/make-whatsapp-service.factory";

const clinicIdParamsSchema = z.object({
  clinicId: z.uuid(),
});

const startSessionBodySchema = z.object({
  engine: z.enum(["WEBJS", "NOWEB", "GOWS"]).optional(),
});

const statusQuerySchema = z.object({
  refresh: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export async function startClinicSessionController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const { clinicId } = clinicIdParamsSchema.parse(req.params);
  const { engine } = startSessionBodySchema.parse(req.body ?? {});

  const service = makeStartClinicWhatsAppSessionServiceFactory();
  const { session, alreadyConnected } = await service.exec({
    clinicId,
    engine,
  });

  return res.status(alreadyConnected ? 200 : 201).send({
    session: {
      id: session.id,
      clinicId: session.clinic_id,
      sessionName: session.session_name,
      status: session.status,
      engine: session.engine,
    },
    alreadyConnected,
  });
}

export async function stopClinicSessionController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const { clinicId } = clinicIdParamsSchema.parse(req.params);

  const service = makeStopClinicWhatsAppSessionServiceFactory();
  await service.exec({ clinicId });

  return res.send({ message: "WhatsApp session stopped" });
}

export async function disconnectClinicSessionController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const { clinicId } = clinicIdParamsSchema.parse(req.params);

  const service = makeDisconnectClinicWhatsAppSessionServiceFactory();
  await service.exec({ clinicId });

  return res.send({ message: "WhatsApp disconnected" });
}

export async function getClinicQrController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const { clinicId } = clinicIdParamsSchema.parse(req.params);

  const service = makeGetClinicWhatsAppQrServiceFactory();
  const { qr, sessionName, status, phoneNumber } = await service.exec({
    clinicId,
  });

  return res.send({ sessionName, status, qr, phoneNumber });
}

export async function getClinicStatusController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const { clinicId } = clinicIdParamsSchema.parse(req.params);
  const { refresh } = statusQuerySchema.parse(req.query ?? {});

  const service = makeGetClinicWhatsAppStatusServiceFactory();
  const result = await service.exec({ clinicId, refresh });

  return res.send(result);
}

export async function wahaWebhookController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const webhookSchema = z.object({
    event: z.string(),
    session: z.string(),
    payload: z.unknown().optional(),
    id: z.string().optional(),
    timestamp: z.number().optional(),
    me: z
      .object({
        id: z.string().optional(),
        pushName: z.string().optional(),
      })
      .optional(),
  });

  const data = webhookSchema.parse(req.body);

  const service = makeProcessWahaWebhookServiceFactory();
  const result = await service.exec({
    event: data.event,
    session: data.session,
    payload: data.payload,
    id: data.id,
    timestamp: data.timestamp,
    me: data.me,
  });

  return res.status(200).send({ received: true, ...result });
}
