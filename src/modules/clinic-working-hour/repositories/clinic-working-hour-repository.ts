import { PrismaClientOrTx } from "@/types/prisma.type";
import { ClinicWorkingHour, Weekday } from "@prisma/client";
import {
  IClinicWorkingHourRepository,
  ICreateWorkingHour,
} from "./clinic-working-hour-repository.interface";

export class ClinicWorkingHourRepository implements IClinicWorkingHourRepository {
  async create(
    client: PrismaClientOrTx,
    { clinicId, endTime, startTime, weekday }: ICreateWorkingHour,
  ): Promise<ClinicWorkingHour> {
    const clinicWorkingHour = await client.clinicWorkingHour.create({
      data: {
        clinic_id: clinicId,
        end_time: endTime,
        start_time: startTime,
        weekday,
      },
    });
    return clinicWorkingHour;
  }

  async createMany(
    client: PrismaClientOrTx,
    clinicId: string,
    data: Omit<ICreateWorkingHour, "clinicId">[],
  ): Promise<void> {
    if (data.length === 0) return;

    await client.clinicWorkingHour.createMany({
      data: data.map(({ weekday, startTime, endTime }) => ({
        clinic_id: clinicId,
        weekday,
        start_time: startTime,
        end_time: endTime,
      })),
    });
  }

  async deleteManyByClinicId(
    client: PrismaClientOrTx,
    clinicId: string,
  ): Promise<void> {
    await client.clinicWorkingHour.deleteMany({
      where: {
        clinic_id: clinicId,
      },
    });
  }

  async findByClinicIdAndWeekday(
    client: PrismaClientOrTx,
    clinicId: string,
    weekday: Weekday,
  ): Promise<ClinicWorkingHour[]> {
    const workingHours = await client.clinicWorkingHour.findMany({
      where: {
        clinic_id: clinicId,
        weekday,
      },
    });
    return workingHours;
  }

  async findAllByClinicId(
    client: PrismaClientOrTx,
    clinicId: string,
  ): Promise<ClinicWorkingHour[]> {
    const workingHours = await client.clinicWorkingHour.findMany({
      where: {
        clinic_id: clinicId,
      },
    });
    return workingHours;
  }
}
