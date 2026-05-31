import { prisma } from "@/db/prisma";
import { IClinicServiceRepository } from "./repositories/clinic-service-repository.interface";

export type ClinicServiceResponse = {
  id: string;
  name: string;
  durationMinutes: number;
  priceCents: number | null;
};

export class ListClinicServicesService {
  constructor(private readonly clinicServiceRepository: IClinicServiceRepository) {}

  async exec(clinicId: string): Promise<{ services: ClinicServiceResponse[] }> {
    const services = await this.clinicServiceRepository.findAllByClinicId(
      prisma,
      clinicId,
    );

    return {
      services: services.map((service) => ({
        id: service.id,
        name: service.name,
        durationMinutes: service.duration_minutes,
        priceCents: service.price_cents,
      })),
    };
  }
}
