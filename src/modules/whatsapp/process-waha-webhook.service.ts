import { prisma } from "@/db/prisma";
import { WhatsAppSessionStatus } from "@prisma/client";
import { IWhatsAppSessionRepository } from "./repositories/whatsapp-session-repository.interface";

export type WahaWebhookEvent =
  | "session.status"
  | "message"
  | "message.any"
  | "message.ack"
  | "state.change"
  | (string & {});

export interface IWahaWebhookPayload {
  event: WahaWebhookEvent;
  session: string;
  payload: unknown;
  id?: string;
  timestamp?: number;
  me?: {
    id?: string;
    pushName?: string;
  };
}

interface IProcessWahaWebhookResponse {
  handled: boolean;
  event: WahaWebhookEvent;
  session: string;
}

const WAHA_TO_DB_STATUS: Record<string, WhatsAppSessionStatus> = {
  STARTING: WhatsAppSessionStatus.STARTING,
  SCAN_QR_CODE: WhatsAppSessionStatus.SCAN_QR_CODE,
  WORKING: WhatsAppSessionStatus.WORKING,
  FAILED: WhatsAppSessionStatus.FAILED,
  STOPPED: WhatsAppSessionStatus.STOPPED,
};

export class ProcessWahaWebhookService {
  constructor(
    private readonly whatsappSessionRepository: IWhatsAppSessionRepository,
  ) {}

  async exec(
    data: IWahaWebhookPayload,
  ): Promise<IProcessWahaWebhookResponse> {
    const session = await this.whatsappSessionRepository.findBySessionName(
      prisma,
      data.session,
    );

    if (!session) {
      // Sess\u00e3o desconhecida para o nosso backend \u2014 ignora silenciosamente.
      return { handled: false, event: data.event, session: data.session };
    }

    switch (data.event) {
      case "session.status": {
        await this.handleSessionStatus(session.id, data);
        return { handled: true, event: data.event, session: data.session };
      }
      case "message":
      case "message.any": {
        await this.handleIncomingMessage(session.id, data);
        return { handled: true, event: data.event, session: data.session };
      }
      default: {
        // Evento reconhecido pelo WAHA mas ainda n\u00e3o tratado pela aplica\u00e7\u00e3o.
        return { handled: false, event: data.event, session: data.session };
      }
    }
  }

  private async handleSessionStatus(
    sessionId: string,
    data: IWahaWebhookPayload,
  ): Promise<void> {
    const rawStatus = this.extractStatus(data.payload);
    if (!rawStatus) return;

    const dbStatus = WAHA_TO_DB_STATUS[rawStatus];
    if (!dbStatus) return;

    const phoneNumber = data.me?.id
      ? data.me.id.replace(/@.*/, "")
      : undefined;

    await this.whatsappSessionRepository.updateStatus(
      prisma,
      sessionId,
      dbStatus,
      phoneNumber,
    );
  }

  private async handleIncomingMessage(
    _sessionId: string,
    _data: IWahaWebhookPayload,
  ): Promise<void> {
    // TODO: encaminhar para o agente (Aurora) ou gatilhos de agendamento.
    // Mantido como ponto de extens\u00e3o para n\u00e3o bloquear este PR.
  }

  private extractStatus(payload: unknown): string | undefined {
    if (payload && typeof payload === "object" && "status" in payload) {
      const status = (payload as { status?: unknown }).status;
      return typeof status === "string" ? status : undefined;
    }
    return undefined;
  }
}
