import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import makeListClinicServicesServiceFactory from "./factories/make-list-clinic-services-service.factory";
import makeUpdateClinicServicesServiceFactory from "./factories/make-update-clinic-services-service.factory";

export async function listClinicServicesController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const paramsSchema = z.object({
    clinicId: z.string(),
  });

  const { clinicId } = paramsSchema.parse(req.params);
  const listClinicServicesService = makeListClinicServicesServiceFactory();
  const services = await listClinicServicesService.exec(clinicId);

  return res.status(200).send(services);
}

export async function updateClinicServicesController(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const paramsSchema = z.object({
    clinicId: z.string(),
  });
  const bodySchema = z.object({
    services: z.array(
      z.object({
        id: z.string().optional(),
        name: z.string().trim().min(1),
        durationMinutes: z.coerce.number().int().nonnegative(),
        priceCents: z.coerce.number().int().nonnegative().nullable().optional(),
      }),
    ),
  });

  const { clinicId } = paramsSchema.parse(req.params);
  const { services } = bodySchema.parse(req.body);
  const updateClinicServicesService = makeUpdateClinicServicesServiceFactory();
  const updatedServices = await updateClinicServicesService.exec({
    clinicId,
    services,
  });

  return res.status(200).send(updatedServices);
}
