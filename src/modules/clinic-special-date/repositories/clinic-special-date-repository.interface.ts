import { ClinicSpecialDate } from "@prisma/client";
import { PrismaClientOrTx } from "@/types/prisma.type";

export interface ICreateClinicSpecialDate {
  clinicId: string
  date: string
  isOpen: boolean
  startTime?: string | null
  endTime?: string | null
  note?: string | null
}

export interface IClinicSpecialDateRepository {
    create(client: PrismaClientOrTx, { clinicId, date, isOpen, startTime, endTime, note }: ICreateClinicSpecialDate): Promise<ClinicSpecialDate>
    createMany(client: PrismaClientOrTx, clinicId: string, data: Omit<ICreateClinicSpecialDate, 'clinicId'>[]): Promise<void>
}
