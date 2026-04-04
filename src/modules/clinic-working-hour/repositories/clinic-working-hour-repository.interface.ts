import { PrismaClientOrTx } from "@/types/prisma.type";
import { ClinicWorkingHour, Weekday } from "@prisma/client";

export interface ICreateWorkingHour {
  clinicId: string
  weekday: Weekday
  startTime: string
  endTime: string
}

export interface IClinicWorkingHourRepository {
    create(client: PrismaClientOrTx, { clinicId, weekday, startTime, endTime}: ICreateWorkingHour): Promise<ClinicWorkingHour>
    createMany(client: PrismaClientOrTx, clinicId: string, data: Omit<ICreateWorkingHour, 'clinicId'>[]): Promise<void>
}