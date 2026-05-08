import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { makeProcessWahaWebhookServiceFactory } from "./factories/make-whatsapp-service.factory";
import { WhatsAppService } from "./whatsapp.service";

// WAHA Core só suporta a sessão "default".
// Com WAHA Plus, trocar por `clinic-${clinicId}` para sessões por clínica.
const SESSION_NAME = "default";

const clinicIdParamsSchema = z.object({
  clinicId: z.uuid(),
});

export async function getClinicQrController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  clinicIdParamsSchema.parse(req.params);

  const waha = new WhatsAppService();

  // Cria e inicia a sessão (ignora se já existir)
  await waha.createAndStartSession(SESSION_NAME);

  // Busca o QR — pode ser null enquanto a sessão ainda está STARTING
  const qr = await waha.getQrCode(SESSION_NAME);

  // Busca o status atual da sessão no WAHA
  const session = await waha.getSession(SESSION_NAME);

  const phoneNumber = session?.me?.id
    ? session.me.id.replace(/@c\.us$/, "")
    : null;

  return res.send({
    qr,
    sessionName: SESSION_NAME,
    status: session?.status ?? null,
    phoneNumber,
    connected: session?.status === "WORKING",
  });
}

export async function getClinicStatusController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  clinicIdParamsSchema.parse(req.params);

  const waha = new WhatsAppService();
  const session = await waha.getSession(SESSION_NAME);

  const phoneNumber = session?.me?.id
    ? session.me.id.replace(/@c\.us$/, "")
    : null;

  return res.send({
    connected: session?.status === "WORKING",
    status: session?.status ?? null,
    sessionName: SESSION_NAME,
    phoneNumber,
  });
}

export async function disconnectClinicSessionController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  clinicIdParamsSchema.parse(req.params);

  const waha = new WhatsAppService();
  await waha.logoutSession(SESSION_NAME);

  return res.send({ message: "WhatsApp disconnected", status: "DISCONNECTED" });
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
