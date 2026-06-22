import { PrismaClientOrTx } from "@/types/prisma.type";
import { ICreateClinicSpecialDate } from "@/types/types";
import { ClinicSpecialDate } from "@prisma/client";

export interface IClinicSpecialDateRepository {
  createMany(
    client: PrismaClientOrTx,
    clinicId: string,
    data: Omit<ICreateClinicSpecialDate, "clinicId">,
  ): Promise<void>;
  findManyByClinicIdAndDate(
    client: PrismaClientOrTx,
    clinicId: string,
    date: string,
  ): Promise<ClinicSpecialDate[]>;
  findManyByClinicId(
    client: PrismaClientOrTx,
    clinicId: string,
  ): Promise<ClinicSpecialDate[]>;
  deleteManyByClinicIdAndDate(
    client: PrismaClientOrTx,
    clinicId: string,
    date: string,
  ): Promise<void>;
}
