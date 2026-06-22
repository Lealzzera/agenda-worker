export type AiConversationRole = "user" | "assistant";

export type AiConversationTurn = {
  role: AiConversationRole;
  content: string;
  createdAt: string;
};

const MAX_TURNS_PER_CONVERSATION = 12;
const conversationMemory = new Map<string, AiConversationTurn[]>();

export function buildAiConversationKey({
  clinicId,
  session,
  chatId,
}: {
  clinicId: string;
  session: string;
  chatId: string;
}) {
  return `${clinicId}:${session}:${chatId}`;
}

export function getAiConversationHistory(conversationKey: string) {
  return conversationMemory.get(conversationKey) ?? [];
}

export function appendAiConversationTurn({
  conversationKey,
  role,
  content,
}: {
  conversationKey: string;
  role: AiConversationRole;
  content: string;
}) {
  const currentHistory = conversationMemory.get(conversationKey) ?? [];
  const nextHistory = [
    ...currentHistory,
    {
      role,
      content,
      createdAt: new Date().toISOString(),
    },
  ].slice(-MAX_TURNS_PER_CONVERSATION);

  conversationMemory.set(conversationKey, nextHistory);
}
