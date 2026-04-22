import { prisma } from "@/db/prisma";
import { IWhatsAppSessionRepository } from "./repositories/whatsapp-session-repository.interface";
import { WhatsAppService } from "./whatsapp.service";

export interface ISendAppointmentNotificationInput {
  clinicId: string;
  clinicName: string;
  customerPhoneNumber: string;
  appointmentDate: Date;
  serviceName?: string;
  notes?: string;
}

export interface IAppointmentNotifier {
  notifyAppointmentCreated(
    input: ISendAppointmentNotificationInput,
  ): Promise<void>;
}

export class WhatsAppAppointmentNotifier implements IAppointmentNotifier {
  constructor(
    private readonly whatsappSessionRepository: IWhatsAppSessionRepository,
    private readonly whatsappService: WhatsAppService,
  ) {}

  async notifyAppointmentCreated(
    input: ISendAppointmentNotificationInput,
  ): Promise<void> {
    const session = await this.whatsappSessionRepository.findByClinicId(
      prisma,
      input.clinicId,
    );
    // Sem sess\u00e3o ativa \u2192 n\u00e3o envia, mas tamb\u00e9m n\u00e3o quebra o fluxo de cria\u00e7\u00e3o.
    if (!session || session.status !== "WORKING") {
      return;
    }

    const text = this.buildMessage(input);
    await this.whatsappService.sendText({
      session: session.session_name,
      phoneNumber: input.customerPhoneNumber,
      text,
    });
  }

  private buildMessage(input: ISendAppointmentNotificationInput): string {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    });
    const when = formatter.format(input.appointmentDate);

    const lines = [
      `Ol\u00e1! Seu agendamento em *${input.clinicName}* foi registrado.`,
      `\uD83D\uDCC5 ${when}`,
    ];
    if (input.serviceName) {
      lines.push(`\uD83D\uDC89 Servi\u00e7o: ${input.serviceName}`);
    }
    if (input.notes) {
      lines.push(`\uD83D\uDCDD Observa\u00e7\u00f5es: ${input.notes}`);
    }
    lines.push("\nEm breve confirmaremos seu hor\u00e1rio.");
    return lines.join("\n");
  }
}
