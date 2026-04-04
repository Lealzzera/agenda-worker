import { ClinicService } from "@prisma/client";
import { PrismaClientOrTx } from "@/types/prisma.type";

export interface ICreateClinicService {
  clinicId: string
  name: string
  durationMinutes: number
  priceCents?: number | null
}

export interface IClinicServiceRepository {
    create(client: PrismaClientOrTx, { clinicId, name, durationMinutes, priceCents }: ICreateClinicService): Promise<ClinicService>
    createMany(client: PrismaClientOrTx, clinicId: string, data: Omit<ICreateClinicService, 'clinicId'>[]): Promise<void>
}
