import { ClinicService } from "@prisma/client";
import { PrismaClientOrTx } from "@/types/prisma.type";

export interface ICreateClinicService {
  clinicId: string
  name: string
  durationMinutes: number
  priceCents?: number | null
}

export interface IUpdateClinicService {
  id: string
  clinicId: string
  name: string
  durationMinutes: number
  priceCents?: number | null
}

export interface IClinicServiceRepository {
    create(client: PrismaClientOrTx, { clinicId, name, durationMinutes, priceCents }: ICreateClinicService): Promise<ClinicService>
    createMany(client: PrismaClientOrTx, clinicId: string, data: Omit<ICreateClinicService, 'clinicId'>[]): Promise<void>
    findByIdAndClinicId(client: PrismaClientOrTx, id: string, clinicId: string): Promise<ClinicService | null>
    findAllByClinicId(client: PrismaClientOrTx, clinicId: string): Promise<ClinicService[]>
    update(client: PrismaClientOrTx, data: IUpdateClinicService): Promise<ClinicService>
    deleteManyByIdsAndClinicId(client: PrismaClientOrTx, clinicId: string, ids: string[]): Promise<void>
}
