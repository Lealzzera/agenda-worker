import { env } from "@/env";

type WahaPresence = "typing" | "paused";

async function setWahaPresence({
  session,
  chatId,
  presence,
}: {
  session: string;
  chatId: string;
  presence: WahaPresence;
}) {
  const response = await fetch(`${env.WAHA_URL}/${session}/presence`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": env.WAHA_API_KEY,
    },
    body: JSON.stringify({
      chatId,
      presence,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`WAHA presence failed: ${response.status} ${errorBody}`);
  }
}

export async function startWahaTyping({
  session,
  chatId,
}: {
  session: string;
  chatId: string;
}) {
  await setWahaPresence({
    session,
    chatId,
    presence: "typing",
  });
}

export async function stopWahaTyping({
  session,
  chatId,
}: {
  session: string;
  chatId: string;
}) {
  await setWahaPresence({
    session,
    chatId,
    presence: "paused",
  });
}
