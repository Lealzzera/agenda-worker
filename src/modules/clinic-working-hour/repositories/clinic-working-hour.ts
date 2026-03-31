import { PrismaClientOrTx } from "@/types/prisma.type";
import { IClinicWorkingHourRepository, ICreateWorkingHour } from "./clinic-working-hour.interface";
import { ClinicWorkingHour } from "@prisma/client";

export class ClinicWorkingHourRepository implements IClinicWorkingHourRepository {
    async create(client: PrismaClientOrTx, { clinicId, endTime, startTime, weekday }: ICreateWorkingHour): Promise<ClinicWorkingHour> {
        const clinicWorkingHour = await client.clinicWorkingHour.create({
            data: {
                clinic_id: clinicId,
                end_time: endTime,
                start_time: startTime,
                weekday
            }
        })
        return clinicWorkingHour
    }
}