import { PrismaClientOrTx } from "@/types/prisma.type";
import { WhatsAppSession, WhatsAppSessionStatus } from "@prisma/client";

export interface ICreateWhatsAppSession {
  clinicId: string;
  sessionName: string;
  engine?: string;
  status?: WhatsAppSessionStatus;
}

export interface IWhatsAppSessionRepository {
  create(
    client: PrismaClientOrTx,
    data: ICreateWhatsAppSession,
  ): Promise<WhatsAppSession>;
  findByClinicId(
    client: PrismaClientOrTx,
    clinicId: string,
  ): Promise<WhatsAppSession | null>;
  findBySessionName(
    client: PrismaClientOrTx,
    sessionName: string,
  ): Promise<WhatsAppSession | null>;
  updateStatus(
    client: PrismaClientOrTx,
    id: string,
    status: WhatsAppSessionStatus,
    phoneNumber?: string | null,
  ): Promise<WhatsAppSession>;
  deleteByClinicId(client: PrismaClientOrTx, clinicId: string): Promise<void>;
}
