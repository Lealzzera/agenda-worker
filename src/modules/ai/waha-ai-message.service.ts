import { env } from "@/env";

export async function sendWahaAiMessage({
  session,
  chatId,
  text,
}: {
  session: string;
  chatId: string;
  text: string;
}) {
  const response = await fetch(`${env.WAHA_URL}/sendText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": env.WAHA_API_KEY,
    },
    body: JSON.stringify({
      session,
      chatId,
      text,
      linkPreview: false,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`WAHA sendText failed: ${response.status} ${errorBody}`);
  }
}
