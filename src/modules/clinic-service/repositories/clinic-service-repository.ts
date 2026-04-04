import { ClinicService } from "@prisma/client";
import { IClinicServiceRepository, ICreateClinicService } from "./clinic-service-repository.interface";
import { PrismaClientOrTx } from "@/types/prisma.type";

export class ClinicServiceRepository implements IClinicServiceRepository {
    async create(client: PrismaClientOrTx, { clinicId, name, durationMinutes, priceCents }: ICreateClinicService): Promise<ClinicService> {
        const clinicService = await client.clinicService.create({
            data: {
                clinic_id: clinicId,
                name,
                duration_minutes: durationMinutes,
                price_cents: priceCents,
            }
        })
        return clinicService
    }

    async createMany(client: PrismaClientOrTx, clinicId: string, data: Omit<ICreateClinicService, 'clinicId'>[]): Promise<void> {
        await client.clinicService.createMany({
            data: data.map(({ name, durationMinutes, priceCents }) => ({
                clinic_id: clinicId,
                name,
                duration_minutes: durationMinutes,
                price_cents: priceCents,
            }))
        })
    }
}
