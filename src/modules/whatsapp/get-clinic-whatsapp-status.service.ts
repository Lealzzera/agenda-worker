import { prisma } from "@/db/prisma";
import { WhatsAppSessionStatus } from "@prisma/client";
import { IWhatsAppSessionRepository } from "./repositories/whatsapp-session-repository.interface";
import { WhatsAppService } from "./whatsapp.service";

interface IGetClinicWhatsAppStatusRequest {
  clinicId: string;
  /** Se true, confere o status atual na WAHA e sincroniza com o banco. */
  refresh?: boolean;
}

interface IGetClinicWhatsAppStatusResponse {
  connected: boolean;
  status: WhatsAppSessionStatus | null;
  sessionName: string | null;
  phoneNumber: string | null;
}

export class GetClinicWhatsAppStatusService {
  constructor(
    private readonly whatsappSessionRepository: IWhatsAppSessionRepository,
    private readonly whatsappService: WhatsAppService,
  ) {}

  async exec({
    clinicId,
    refresh,
  }: IGetClinicWhatsAppStatusRequest): Promise<IGetClinicWhatsAppStatusResponse> {
    let session = await this.whatsappSessionRepository.findByClinicId(
      prisma,
      clinicId,
    );

    if (!session) {
      return {
        connected: false,
        status: null,
        sessionName: null,
        phoneNumber: null,
      };
    }

    if (refresh) {
      const waha = await this.whatsappService.getSession(session.session_name);
      const mapped = this.mapStatus(waha?.status);
      if (mapped && mapped !== session.status) {
        const phoneNumber = waha?.me?.id
          ? waha.me.id.replace(/@.*/, "")
          : session.phone_number;
        session = await this.whatsappSessionRepository.updateStatus(
          prisma,
          session.id,
          mapped,
          phoneNumber,
        );
      }
    }

    return {
      connected: session.status === WhatsAppSessionStatus.WORKING,
      status: session.status,
      sessionName: session.session_name,
      phoneNumber: session.phone_number,
    };
  }

  private mapStatus(
    status: string | undefined,
  ): WhatsAppSessionStatus | null {
    if (!status) return null;
    const map: Record<string, WhatsAppSessionStatus> = {
      STARTING: WhatsAppSessionStatus.STARTING,
      SCAN_QR_CODE: WhatsAppSessionStatus.SCAN_QR_CODE,
      WORKING: WhatsAppSessionStatus.WORKING,
      FAILED: WhatsAppSessionStatus.FAILED,
      STOPPED: WhatsAppSessionStatus.STOPPED,
    };
    return map[status] ?? null;
  }
}
