import { PrismaClientOrTx } from "@/types/prisma.type";
import { WhatsAppSession, WhatsAppSessionStatus } from "@prisma/client";
import {
  ICreateWhatsAppSession,
  IWhatsAppSessionRepository,
} from "./whatsapp-session-repository.interface";

export class WhatsAppSessionRepository implements IWhatsAppSessionRepository {
  async create(
    client: PrismaClientOrTx,
    { clinicId, sessionName, engine, status }: ICreateWhatsAppSession,
  ): Promise<WhatsAppSession> {
    const session = await client.whatsAppSession.create({
      data: {
        clinic_id: clinicId,
        session_name: sessionName,
        engine: engine ?? "WEBJS",
        status: status ?? WhatsAppSessionStatus.STARTING,
      },
    });
    return session;
  }

  async findByClinicId(
    client: PrismaClientOrTx,
    clinicId: string,
  ): Promise<WhatsAppSession | null> {
    return client.whatsAppSession.findUnique({
      where: { clinic_id: clinicId },
    });
  }

  async findBySessionName(
    client: PrismaClientOrTx,
    sessionName: string,
  ): Promise<WhatsAppSession | null> {
    return client.whatsAppSession.findUnique({
      where: { session_name: sessionName },
    });
  }

  async updateStatus(
    client: PrismaClientOrTx,
    id: string,
    status: WhatsAppSessionStatus,
    phoneNumber?: string | null,
  ): Promise<WhatsAppSession> {
    return client.whatsAppSession.update({
      where: { id },
      data: {
        status,
        ...(phoneNumber !== undefined ? { phone_number: phoneNumber } : {}),
      },
    });
  }

  async deleteByClinicId(
    client: PrismaClientOrTx,
    clinicId: string,
  ): Promise<void> {
    await client.whatsAppSession.delete({
      where: { clinic_id: clinicId },
    });
  }
}
