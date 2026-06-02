export type AiReplyJob = {
  clinicId: string;
  session: string;
  chatId: string;
  messageId?: string;
  message: string;
  contactName?: string | null;
};
