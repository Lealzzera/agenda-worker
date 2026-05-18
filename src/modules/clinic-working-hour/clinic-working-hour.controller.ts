import { FastifyReply, FastifyRequest } from "fastify";
import makeListAllWorkingHourServiceFactory from "./factories/make-list-all-working-hour-service.factory";

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
