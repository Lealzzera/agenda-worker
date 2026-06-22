import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import makeListAllWorkingHourServiceFactory from "./factories/make-list-all-working-hour-service.factory";
import makeUpdateWorkingHourServiceFactory from "./factories/make-update-working-hour-service.factory";

export async function listAllWorkingHoursController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const { clinicId } = req.params as { clinicId: string };

  try {
    if (!clinicId) {
      return res.status(400).send({ error: "Clinic ID is required" });
    }

    const listAllWorkingHoursService = makeListAllWorkingHourServiceFactory();
    const result = await listAllWorkingHoursService.exec(clinicId);

    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send({ error: "Internal server error" });
  }
}

export async function updateWorkingHoursController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const paramsSchema = z.object({
    clinicId: z.string(),
  });
  const bodySchema = z.object({
    workingHours: z.array(
      z.object({
        weekday: z.enum([
          "SUNDAY",
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
        ]),
        startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
        endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
      }),
    ),
  });

  const { clinicId } = paramsSchema.parse(req.params);
  const { workingHours } = bodySchema.parse(req.body);

  const updateWorkingHourService = makeUpdateWorkingHourServiceFactory();
  await updateWorkingHourService.exec({ clinicId, workingHours });

  return res.status(200).send({
    success: true,
    message: "Working hours updated successfully.",
  });
}
