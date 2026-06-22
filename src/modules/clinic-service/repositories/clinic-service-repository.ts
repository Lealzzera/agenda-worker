import { ClinicService } from "@prisma/client";
import {
  IClinicServiceRepository,
  ICreateClinicService,
  IUpdateClinicService,
} from "./clinic-service-repository.interface";
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

    async findByIdAndClinicId(client: PrismaClientOrTx, id: string, clinicId: string): Promise<ClinicService | null> {
        const clinicService = await client.clinicService.findFirst({
            where: {
                id,
                clinic_id: clinicId,
            }
        })
        return clinicService
    }

    async findAllByClinicId(client: PrismaClientOrTx, clinicId: string): Promise<ClinicService[]> {
        const services = await client.clinicService.findMany({
            where: {
                clinic_id: clinicId,
            },
            orderBy: {
                created_at: "asc",
            },
        })
        return services
    }

    async update(client: PrismaClientOrTx, { id, name, durationMinutes, priceCents }: IUpdateClinicService): Promise<ClinicService> {
        const clinicService = await client.clinicService.update({
            where: {
                id,
            },
            data: {
                name,
                duration_minutes: durationMinutes,
                price_cents: priceCents,
            },
        })
        return clinicService
    }

    async deleteManyByIdsAndClinicId(client: PrismaClientOrTx, clinicId: string, ids: string[]): Promise<void> {
        if (ids.length === 0) return

        await client.clinicService.deleteMany({
            where: {
                clinic_id: clinicId,
                id: {
                    in: ids,
                },
            },
        })
    }
}
