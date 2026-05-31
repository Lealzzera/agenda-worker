import { prisma } from "@/db/prisma";
import { BadRequestError } from "@/errors/bad-request.error";
import {
  IClinicServiceRepository,
  ICreateClinicService,
} from "./repositories/clinic-service-repository.interface";
import { ClinicServiceResponse } from "./list-clinic-services.service";

type UpdateClinicServicesRequest = {
  clinicId: string;
  services: Array<Omit<ICreateClinicService, "clinicId"> & { id?: string }>;
};

export class UpdateClinicServicesService {
  constructor(private readonly clinicServiceRepository: IClinicServiceRepository) {}

  async exec({
    clinicId,
    services,
  }: UpdateClinicServicesRequest): Promise<{ services: ClinicServiceResponse[] }> {
    await prisma.$transaction(async (tx) => {
      const currentServices =
        await this.clinicServiceRepository.findAllByClinicId(tx, clinicId);

      const requestedIds = services
        .map((service) => service.id)
        .filter((serviceId): serviceId is string => Boolean(serviceId));

      const removedServiceIds = currentServices
        .filter((service) => !requestedIds.includes(service.id))
        .map((service) => service.id);

      await this.clinicServiceRepository.deleteManyByIdsAndClinicId(
        tx,
        clinicId,
        removedServiceIds,
      );

      for (const service of services) {
        if (service.id) {
          const existingService =
            await this.clinicServiceRepository.findByIdAndClinicId(
              tx,
              service.id,
              clinicId,
            );

          if (!existingService) {
            throw new BadRequestError("Service not found for this clinic.");
          }

          await this.clinicServiceRepository.update(tx, {
            id: service.id,
            clinicId,
            name: service.name,
            durationMinutes: service.durationMinutes,
            priceCents: service.priceCents,
          });
          continue;
        }

        await this.clinicServiceRepository.create(tx, {
          clinicId,
          name: service.name,
          durationMinutes: service.durationMinutes,
          priceCents: service.priceCents,
        });
      }
    });

    const updatedServices = await this.clinicServiceRepository.findAllByClinicId(
      prisma,
      clinicId,
    );

    return {
      services: updatedServices.map((service) => ({
        id: service.id,
        name: service.name,
        durationMinutes: service.duration_minutes,
        priceCents: service.price_cents,
      })),
    };
  }
}
