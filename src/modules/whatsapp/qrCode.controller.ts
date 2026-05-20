import { env } from "@/env";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export async function postQrCodeController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const bodySchema = z.object({
    sessionName: z.string(),
  });

  const { sessionName } = bodySchema.parse(req.body);

  if (!env.WAHA_API_KEY) {
    return res.status(500).send({ error: "WAHA_API_KEY is not defined" });
  }

  try {
    const getWahaSession = await fetch(`${env.WAHA_URL}/sessions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": env.WAHA_API_KEY,
      },
    });

    const getWahaSessionResultJson = await getWahaSession.json();

    switch (
      getWahaSessionResultJson.length &&
      getWahaSessionResultJson[0].status
    ) {
      case "WORKING":
        const formattedPhoneNumber = getWahaSessionResultJson[0].me.id.replace(
          /^(\d{2})(\d{2})(\d{5})(\d{4})@c\.us$/,
          "+$1 $2 $3-$4",
        );
        return res.status(200).send({
          sessionName: getWahaSessionResultJson[0].name,
          status: getWahaSessionResultJson[0].status,
          me: {
            ...getWahaSessionResultJson[0].me,
            id: formattedPhoneNumber,
          },
        });

      case "SCAN_QR_CODE":
        const qrCode = await fetch(
          `${env.WAHA_URL}/${sessionName}/auth/qr?format=image`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-Api-Key": env.WAHA_API_KEY,
            },
          },
        );

        const qrCodeBuffer = await qrCode.arrayBuffer();
        const base64Image = Buffer.from(qrCodeBuffer).toString("base64");
        const imageUrl = `data:image/png;base64,${base64Image}`;

        return res.status(200).send({
          qrCode: imageUrl,
        });

      case "FAILED":
        await fetch(`${env.WAHA_URL}/sessions/${sessionName}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": env.WAHA_API_KEY,
          },
        });

      default:
        break;
    }

    const wahaSession = await fetch(`${env.WAHA_URL}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": env.WAHA_API_KEY,
      },
      body: JSON.stringify({
        name: sessionName,
        start: true,
        config: {
          noweb: {
            store: {
              enabled: true,
              fullSync: true,
            },
          },
          webhooks: [
            {
              url: env.WAHA_WEBHOOK_URL,
              events: [
                "message.any",
                "session.status",
                "message.ack",
                "message.reaction",
                "presence.update",
                "message.waiting",
              ],
              hmac: {
                key: env.WAHA_WEBHOOK_SECRET,
              },
              retries: {
                delaySeconds: 2,
                attempts: 5,
                policy: "linear",
              },
              customHeaders: [
                {
                  name: "X-Request-ID",
                  value: "123",
                },
              ],
            },
          ],
        },
      }),
    });

    const responseJson = await wahaSession.json();

    if (responseJson.statusCode === 422) {
      const restartSession = await fetch(
        `${env.WAHA_URL}/sessions/${sessionName}/restart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": env.WAHA_API_KEY,
          },
        },
      );

      await restartSession.json();

      const qrCode = await fetch(
        `${env.WAHA_URL}/${sessionName}/auth/qr?format=image`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": env.WAHA_API_KEY,
          },
        },
      );

      const arrayBuffer = await qrCode.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString("base64");
      const imageUrl = `data:image/png;base64,${base64Image}`;

      return { qrCode: imageUrl };
    }
    const qrCode = await fetch(
      `${env.WAHA_URL}/${sessionName}/auth/qr?format=image`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": env.WAHA_API_KEY,
        },
      },
    );

    const arrayBuffer = await qrCode.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const imageUrl = `data:image/png;base64,${base64Image}`;

    return { qrCode: imageUrl };
  } catch (error) {
    console.log(error);
    console.error(error);
    return res.status(500).send({ error: "Internal server error" });
  }
}
