import { prisma } from "@/db/prisma";
import { env } from "@/env";
import { ConflictError } from "@/errors/conflict.error";
import { NotFoundError } from "@/errors/not-found.error";
import { IClinicRepository } from "@/modules/clinics/repositories/clinic-repository.interface";
import { WhatsAppSession, WhatsAppSessionStatus } from "@prisma/client";
import { IWhatsAppSessionRepository } from "./repositories/whatsapp-session-repository.interface";
import {
  IWahaSessionInfo,
  WahaSessionEngine,
  WhatsAppService,
} from "./whatsapp.service";

interface IStartClinicWhatsAppSessionRequest {
  clinicId: string;
  engine?: WahaSessionEngine;
}

interface IStartClinicWhatsAppSessionResponse {
  session: WhatsAppSession;
  alreadyConnected: boolean;
}

const DEFAULT_WEBHOOK_EVENTS = ["session.status", "message", "message.any"];

export class StartClinicWhatsAppSessionService {
  constructor(
    private readonly clinicRepository: IClinicRepository,
    private readonly whatsappSessionRepository: IWhatsAppSessionRepository,
    private readonly whatsappService: WhatsAppService,
  ) {}

  async exec({
    clinicId,
    engine,
  }: IStartClinicWhatsAppSessionRequest): Promise<IStartClinicWhatsAppSessionResponse> {
    const clinic = await this.clinicRepository.findById(prisma, clinicId);
    if (!clinic) {
      throw new NotFoundError("Clinic not found.");
    }

    const existing = await this.whatsappSessionRepository.findByClinicId(
      prisma,
      clinicId,
    );

    const sessionName = this.resolveSessionName(existing, clinic.slug);

    // No WAHA Core s\u00f3 existe a sess\u00e3o "default" \u2014 1 cl\u00ednica por inst\u00e2ncia.
    if (env.WAHA_EDITION === "core" && !existing) {
      const sessionOwnedByAnotherClinic =
        await this.whatsappSessionRepository.findBySessionName(
          prisma,
          sessionName,
        );
      if (
        sessionOwnedByAnotherClinic &&
        sessionOwnedByAnotherClinic.clinic_id !== clinicId
      ) {
        throw new ConflictError(
          "WAHA Core only supports a single clinic per instance. Disconnect the other clinic first or upgrade to WAHA Plus.",
        );
      }
    }

    // 1) Verifica se a sess\u00e3o j\u00e1 existe na WAHA
    const wahaSession = await this.whatsappService.getSession(sessionName);

    // 2) Decide como iniciar
    if (!wahaSession) {
      await this.whatsappService.startSession({
        name: sessionName,
        engine,
        webhook: env.WAHA_WEBHOOK_URL
          ? { url: env.WAHA_WEBHOOK_URL, events: DEFAULT_WEBHOOK_EVENTS }
          : undefined,
      });
    } else if (wahaSession.status === "STOPPED") {
      await this.whatsappService.startExistingSession(sessionName);
    }
    // se j\u00e1 est\u00e1 STARTING / SCAN_QR_CODE / WORKING, n\u00e3o faz nada

    // 3) Persiste / atualiza o registro no banco
    const mappedStatus = this.mapWahaStatus(wahaSession);
    const session = existing
      ? await this.whatsappSessionRepository.updateStatus(
          prisma,
          existing.id,
          mappedStatus,
        )
      : await this.whatsappSessionRepository.create(prisma, {
          clinicId,
          sessionName,
          engine: engine ?? "WEBJS",
          status: mappedStatus,
        });

    return {
      session,
      alreadyConnected: wahaSession?.status === "WORKING",
    };
  }

  private resolveSessionName(
    existing: WhatsAppSession | null,
    clinicSlug: string,
  ): string {
    if (existing) return existing.session_name;
    if (env.WAHA_EDITION === "core") return "default";
    return `clinic-${clinicSlug}`;
  }

  private mapWahaStatus(
    waha: IWahaSessionInfo | null,
  ): WhatsAppSessionStatus {
    if (!waha) return WhatsAppSessionStatus.STARTING;
    const map: Record<string, WhatsAppSessionStatus> = {
      STARTING: WhatsAppSessionStatus.STARTING,
      SCAN_QR_CODE: WhatsAppSessionStatus.SCAN_QR_CODE,
      WORKING: WhatsAppSessionStatus.WORKING,
      FAILED: WhatsAppSessionStatus.FAILED,
      STOPPED: WhatsAppSessionStatus.STARTING, // acabamos de dar start
    };
    return map[waha.status] ?? WhatsAppSessionStatus.STARTING;
  }
}
