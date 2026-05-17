import { PrismaClientOrTx } from "@/types/prisma.type";
import { ICreateClinicSpecialDate } from "@/types/types";
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
  ): Promise<any[]> {
    const result = await client.clinicSpecialDate.findMany({
      where: {
        clinic_id: clinicId,
        date,
      },
    });
    return result;
  }
}
