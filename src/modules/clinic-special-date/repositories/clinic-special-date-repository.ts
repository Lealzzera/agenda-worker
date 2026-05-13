import { ClinicSpecialDate } from "@prisma/client";
import { IClinicSpecialDateRepository, ICreateClinicSpecialDate } from "./clinic-special-date-repository.interface";
import { PrismaClientOrTx } from "@/types/prisma.type";

export class ClinicSpecialDateRepository implements IClinicSpecialDateRepository {
    async create(client: PrismaClientOrTx, { clinicId, date, isOpen, startTime, endTime, note }: ICreateClinicSpecialDate): Promise<ClinicSpecialDate> {
        const clinicSpecialDate = await client.clinicSpecialDate.create({
            data: {
                clinic_id: clinicId,
                date,
                is_open: isOpen,
                start_time: startTime,
                end_time: endTime,
                note,
            }
        })
        return clinicSpecialDate
    }

    async createMany(client: PrismaClientOrTx, clinicId: string, data: Omit<ICreateClinicSpecialDate, 'clinicId'>[]): Promise<void> {
        await client.clinicSpecialDate.createMany({
            data: data.map(({ date, isOpen, startTime, endTime, note }) => ({
                clinic_id: clinicId,
                date,
                is_open: isOpen,
                start_time: startTime,
                end_time: endTime,
                note,
            }))
        })
    }

    async findByClinicIdAndDate(client: PrismaClientOrTx, clinicId: string, date: string): Promise<ClinicSpecialDate | null> {
        const specialDate = await client.clinicSpecialDate.findUnique({
            where: {
                clinic_id_date: {
                    clinic_id: clinicId,
                    date,
                }
            }
        })
        return specialDate
    }
}
