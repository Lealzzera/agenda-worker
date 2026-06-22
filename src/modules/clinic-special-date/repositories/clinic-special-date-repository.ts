import { PrismaClientOrTx } from "@/types/prisma.type";
import { ICreateClinicSpecialDate } from "@/types/types";
import { ClinicSpecialDate } from "@prisma/client";
import { IClinicSpecialDateRepository } from "./clinic-special-date-repository.interface";

export class ClinicSpecialDateRepository implements IClinicSpecialDateRepository {
  async createMany(
    client: PrismaClientOrTx,
    clinicId: string,
    data: Omit<ICreateClinicSpecialDate, "clinicId">,
  ): Promise<void> {
    const hasPeriods = data.periods && data.periods.length > 0;

    if (!data.isOpen || !hasPeriods) {
      await client.clinicSpecialDate.create({
        data: {
          clinic_id: clinicId,
          date: data.specialDate,
          is_open: data.isOpen,
          start_time: null,
          end_time: null,
          note: data.note || null,
        },
      });
      return;
    }

    await client.clinicSpecialDate.createMany({
      data: data.periods!.map((period) => ({
        clinic_id: clinicId,
        date: data.specialDate,
        is_open: data.isOpen,
        start_time: period.startTime,
        end_time: period.endTime,
        note: data.note || null,
      })),
    });
  }

  async findManyByClinicIdAndDate(
    client: PrismaClientOrTx,
    clinicId: string,
    date: string,
  ): Promise<ClinicSpecialDate[]> {
    const result = await client.clinicSpecialDate.findMany({
      where: {
        clinic_id: clinicId,
        date,
      },
    });
    return result;
  }

  async findManyByClinicId(
    client: PrismaClientOrTx,
    clinicId: string,
  ): Promise<ClinicSpecialDate[]> {
    const result = await client.clinicSpecialDate.findMany({
      where: {
        clinic_id: clinicId,
      },
      orderBy: {
        date: "asc",
      },
    });
    return result;
  }

  async deleteManyByClinicIdAndDate(
    client: PrismaClientOrTx,
    clinicId: string,
    date: string,
  ): Promise<void> {
    await client.clinicSpecialDate.deleteMany({
      where: {
        clinic_id: clinicId,
        date,
      },
    });
  }
}
