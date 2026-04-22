import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import { IWhatsAppSessionRepository } from "./repositories/whatsapp-session-repository.interface";
import { WahaError, WhatsAppService } from "./whatsapp.service";

interface IDisconnectClinicWhatsAppSessionRequest {
  clinicId: string;
}

/**
 * Desvincula o WhatsApp da cl\u00ednica em definitivo.
 * Apaga o pareamento na WAHA (DELETE) e remove o registro local.
 * Pr\u00f3xima conex\u00e3o exigir\u00e1 escanear o QR novamente.
 */
export class DisconnectClinicWhatsAppSessionService {
  constructor(
    private readonly whatsappSessionRepository: IWhatsAppSessionRepository,
    private readonly whatsappService: WhatsAppService,
  ) {}

  async exec({
    clinicId,
  }: IDisconnectClinicWhatsAppSessionRequest): Promise<void> {
    const session = await this.whatsappSessionRepository.findByClinicId(
      prisma,
      clinicId,
    );
    if (!session) {
      throw new NotFoundError("No WhatsApp session found for this clinic.");
    }

    try {
      await this.whatsappService.logoutSession(session.session_name);
    } catch (err) {
      // se a sess\u00e3o j\u00e1 n\u00e3o existe na WAHA, seguimos com a remo\u00e7\u00e3o local.
      if (!(err instanceof WahaError) || err.status !== 404) throw err;
    }

    await this.whatsappSessionRepository.deleteByClinicId(prisma, clinicId);
  }
}
