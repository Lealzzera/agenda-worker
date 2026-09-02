import { prisma } from "@/db/prisma";
import { WhatsAppSessionStatus } from "@prisma/client";

type PersistWahaSession = {
  name: string;
  status?: string;
  phoneNumber?: string | null;
  engine?: string | null;
};

export function mapWahaSessionStatus(status?: string): WhatsAppSessionStatus {
  switch (status) {
    case "WORKING":
      return "WORKING";
    case "SCAN_QR_CODE":
      return "SCAN_QR_CODE";
    case "FAILED":
      return "FAILED";
    case "STOPPED":
      return "STOPPED";
    default:
      return "STARTING";
  }
}

export async function persistWahaSession(
  clinicId: string,
  session: PersistWahaSession,
) {
  if (session.name !== clinicId) {
    throw new Error("WAHA session name must match its clinic id");
  }

  return prisma.whatsAppSession.upsert({
    where: { clinic_id: clinicId },
    update: {
      session_name: clinicId,
      status: mapWahaSessionStatus(session.status),
      phone_number: session.phoneNumber ?? undefined,
      engine: session.engine ?? undefined,
    },
    create: {
      clinic_id: clinicId,
      session_name: clinicId,
      status: mapWahaSessionStatus(session.status),
      phone_number: session.phoneNumber,
      engine: session.engine ?? "WEBJS",
    },
  });
}
