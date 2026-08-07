import { prisma } from "@/db/prisma";
import { env } from "@/env";
import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { ClinicRepository } from "../clinics/repositories/clinic-repository";

type WahaSession = {
  name: string;
  status?: string;
  me?: {
    id?: string;
  };
};

function buildWahaSessionConfig(clinicId: string) {
  return {
    metadata: {
      clinicId,
    },
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
  };
}

async function updateWahaSessionConfig(sessionName: string, clinicId: string) {
  const response = await fetch(`${env.WAHA_URL}/sessions/${sessionName}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": env.WAHA_API_KEY,
    },
    body: JSON.stringify({
      name: sessionName,
      config: buildWahaSessionConfig(clinicId),
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(
      `WAHA session config update failed: ${response.status} ${responseBody}`,
    );
  }
}

async function getQrCodeImage(sessionName: string) {
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

  return `data:image/png;base64,${base64Image}`;
}

export async function postQrCodeController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const bodySchema = z.object({
    sessionName: z.string(),
    clinicId: z.string(),
  });

  const clinicRepository = new ClinicRepository();

  const { sessionName, clinicId } = bodySchema.parse(req.body);

  if (!env.WAHA_API_KEY) {
    return res.status(500).send({ error: "WAHA_API_KEY is not defined" });
  }

  const doesTheClinicExist = await clinicRepository.findById(prisma, clinicId);

  if (!doesTheClinicExist) {
    return res.status(404).send({ error: "Clinic not found" });
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
    const existingSession = (getWahaSessionResultJson as WahaSession[]).find(
      (session) => session.name === sessionName,
    );

    if (existingSession) {
      await updateWahaSessionConfig(sessionName, clinicId);
    }

    switch (existingSession?.status) {
      case "WORKING":
        const formattedPhoneNumber = existingSession.me?.id?.replace(
          /^(\d{2})(\d{2})(\d{5})(\d{4})@c\.us$/,
          "+$1 $2 $3-$4",
        );
        return res.status(200).send({
          sessionName: existingSession.name,
          status: existingSession.status,
          me: {
            ...existingSession.me,
            id: formattedPhoneNumber ?? existingSession.me?.id,
          },
        });

      case "SCAN_QR_CODE":
        return res.status(200).send({
          qrCode: await getQrCodeImage(sessionName),
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
        config: buildWahaSessionConfig(clinicId),
      }),
    });

    const responseJson = await wahaSession.json();

    if (responseJson.statusCode === 422) {
      await updateWahaSessionConfig(sessionName, clinicId);

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

      return res.status(200).send({
        qrCode: await getQrCodeImage(sessionName),
      });
    }

    return res.status(200).send({
      qrCode: await getQrCodeImage(sessionName),
    });
  } catch (error) {
    req.log.error(error, "Failed to create or update WAHA session");
    return res.status(500).send({ error: "Internal server error" });
  }
}
