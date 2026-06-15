import { prisma } from "@/db/prisma";

export async function isWhatsappConversationAiEnabled({
  clinicId,
  session,
  chatId,
}: {
  clinicId: string;
  session: string;
  chatId: string;
}) {
  const conversation = await prisma.whatsAppConversation.findFirst({
    where: {
      clinic_id: clinicId,
      session,
      chat_id: chatId,
    },
    select: {
      ai_enabled: true,
    },
  });

  return conversation?.ai_enabled ?? true;
}
