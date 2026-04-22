import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import { WhatsAppSessionStatus } from "@prisma/client";
import { IWhatsAppSessionRepository } from "./repositories/whatsapp-session-repository.interface";
import { WahaError, WhatsAppService } from "./whatsapp.service";

interface IStopClinicWhatsAppSessionRequest {
  clinicId: string;
}

/**
 * Pausa a sess\u00e3o do WAHA mantendo o pareamento.
 * Pensado pra ser chamado no logout / beforeunload do frontend.
 * Mant\u00e9m o registro em `whatsapp_sessions` para que o pr\u00f3ximo login
 * reinicie a sess\u00e3o sem pedir QR novo.
 */
export class StopClinicWhatsAppSessionService {
  constructor(
    private readonly whatsappSessionRepository: IWhatsAppSessionRepository,
    private readonly whatsappService: WhatsAppService,
  ) {}

  async exec({ clinicId }: IStopClinicWhatsAppSessionRequest): Promise<void> {
    const session = await this.whatsappSessionRepository.findByClinicId(
      prisma,
      clinicId,
    );
    if (!session) {
      throw new NotFoundError("No WhatsApp session found for this clinic.");
    }

    try {
      await this.whatsappService.stopSession(session.session_name);
    } catch (err) {
      // Se a sess\u00e3o n\u00e3o existe mais na WAHA (restart do servidor, etc.),
      // ainda assim atualizamos nosso banco. Outros erros propagam.
      if (!(err instanceof WahaError) || err.status !== 404) throw err;
    }

    await this.whatsappSessionRepository.updateStatus(
      prisma,
      session.id,
      WhatsAppSessionStatus.STOPPED,
    );
  }
}
