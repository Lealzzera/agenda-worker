import { env } from "@/env";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function disconnectController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const paramsSchema = z.object({
    sessionName: z.string(),
  });

  const { sessionName } = paramsSchema.parse(req.params);

  if (!env.WAHA_API_KEY) {
    return res.status(500).send({ error: "WAHA_API_KEY is not defined" });
  }
  try {
    const response = await fetch(`${env.WAHA_URL}/sessions/${sessionName}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": env.WAHA_API_KEY,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      req.log.error(
        { status: response.status, body },
        "WAHA disconnect failed",
      );
      return res.status(502).send({ error: "Failed to disconnect session" });
    }

    return res.send({ status: "DISCONNECTED" });
  } catch (error) {
    req.log.error({ error }, "disconnect controller error");
    return res.status(500).send({ error: "Failed to disconnect session" });
  }
}
