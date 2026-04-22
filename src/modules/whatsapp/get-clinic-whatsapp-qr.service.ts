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

interface IGetClinicWhatsAppQrRequest {
  clinicId: string;
}

interface IGetClinicWhatsAppQrResponse {
  qr: string | null;
  sessionName: string;
  status: WhatsAppSessionStatus;
  phoneNumber: string | null;
}

const DEFAULT_WEBHOOK_EVENTS = ["session.status", "message", "message.any"];

const STATUS_MAP: Record<string, WhatsAppSessionStatus> = {
  STARTING: WhatsAppSessionStatus.STARTING,
  SCAN_QR_CODE: WhatsAppSessionStatus.SCAN_QR_CODE,
  WORKING: WhatsAppSessionStatus.WORKING,
  FAILED: WhatsAppSessionStatus.FAILED,
  STOPPED: WhatsAppSessionStatus.STOPPED,
};

/**
 * Endpoint "mágico" pra obter o QR do WhatsApp da clínica.
 * Ele cuida de TUDO sozinho:
 *   - Se a clínica não tem sessão no DB, cria.
 *   - Se o WAHA não conhece a sessão, cria lá também.
 *   - Se a sessão tá STOPPED, religa.
 *   - Sincroniza o status e o phone_number com o WAHA.
 *   - Retorna o QR em data URI quando o WAHA estiver em SCAN_QR_CODE.
 *
 * O front só precisa chamar esse endpoint em loop. Fim.
 */
export class GetClinicWhatsAppQrService {
  constructor(
    private readonly clinicRepository: IClinicRepository,
    private readonly whatsappSessionRepository: IWhatsAppSessionRepository,
    private readonly whatsappService: WhatsAppService,
  ) {}

  async exec({
    clinicId,
  }: IGetClinicWhatsAppQrRequest): Promise<IGetClinicWhatsAppQrResponse> {
    const clinic = await this.clinicRepository.findById(prisma, clinicId);
    if (!clinic) {
      throw new NotFoundError("Clinic not found.");
    }

    // 1) Garante que existe um registro de sessão no DB
    let session = await this.ensureDbSession(clinicId, clinic.slug);

    // 2) Garante que a sessão existe/está rodando no WAHA
    const waha = await this.ensureWahaSession(session);

    // 3) Sincroniza DB com o estado real do WAHA (status + phone)
    session = await this.syncSession(session, waha);

    // 4) Busca o QR (só vem preenchido quando status === SCAN_QR_CODE)
    const qr = await this.whatsappService.getQrCode(session.session_name);

    return {
      qr,
      sessionName: session.session_name,
      status: session.status,
      phoneNumber: session.phone_number,
    };
  }

  private async ensureDbSession(
    clinicId: string,
    clinicSlug: string,
  ): Promise<WhatsAppSession> {
    const existing = await this.whatsappSessionRepository.findByClinicId(
      prisma,
      clinicId,
    );
    if (existing) return existing;

    const sessionName =
      env.WAHA_EDITION === "core" ? "default" : `clinic-${clinicSlug}`;

    // Em Core só pode 1 clínica por instância — valida conflito antes
    if (env.WAHA_EDITION === "core") {
      const owner = await this.whatsappSessionRepository.findBySessionName(
        prisma,
        sessionName,
      );
      if (owner && owner.clinic_id !== clinicId) {
        throw new ConflictError(
          "WAHA Core only supports a single clinic per instance. Disconnect the other clinic first or upgrade to WAHA Plus.",
        );
      }
    }

    return this.whatsappSessionRepository.create(prisma, {
      clinicId,
      sessionName,
      engine: "WEBJS" as WahaSessionEngine,
      status: WhatsAppSessionStatus.STARTING,
    });
  }

  private async ensureWahaSession(
    session: WhatsAppSession,
  ): Promise<IWahaSessionInfo | null> {
    const existing = await this.whatsappService.getSession(
      session.session_name,
    );

    if (!existing) {
      // WAHA não conhece a sessão — cria
      await this.whatsappService.startSession({
        name: session.session_name,
        engine: (session.engine as WahaSessionEngine) ?? "WEBJS",
        webhook: env.WAHA_WEBHOOK_URL
          ? {
              url: env.WAHA_WEBHOOK_URL,
              events: DEFAULT_WEBHOOK_EVENTS,
            }
          : undefined,
      });
      return this.whatsappService.getSession(session.session_name);
    }

    if (existing.status === "STOPPED") {
      await this.whatsappService.startExistingSession(session.session_name);
      return this.whatsappService.getSession(session.session_name);
    }

    return existing;
  }

  private async syncSession(
    session: WhatsAppSession,
    waha: IWahaSessionInfo | null,
  ): Promise<WhatsAppSession> {
    const mapped = waha?.status ? STATUS_MAP[waha.status] : undefined;
    const phoneNumber = waha?.me?.id
      ? waha.me.id.replace(/@.*/, "")
      : session.phone_number;

    if (
      mapped &&
      (mapped !== session.status || phoneNumber !== session.phone_number)
    ) {
      return this.whatsappSessionRepository.updateStatus(
        prisma,
        session.id,
        mapped,
        phoneNumber,
      );
    }

    return session;
  }
}
