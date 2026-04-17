import { PrismaClientOrTx } from "@/types/prisma.type";
import { Plan } from "@prisma/client";

export interface ICreatePlan {
  name: string;
  description?: string;
  code: string;
  priceMonthly: number;
  maxUsers?: number;
  maxWhatsappSessions?: number;
  maxMonthlyAppointments?: number | null;
}

export interface IUpdatePlan {
  id: string;
  name?: string;
  description?: string;
  priceMonthly?: number;
  maxUsers?: number;
  maxWhatsappSessions?: number;
  maxMonthlyAppointments?: number | null;
  trialDays?: number;
}

export interface IPlanRepository {
  create(
    client: PrismaClientOrTx,
    {
      name,
      description,
      code,
      priceMonthly,
      maxUsers,
      maxWhatsappSessions,
      maxMonthlyAppointments,
    }: ICreatePlan,
  ): Promise<Plan>;
  findByName(client: PrismaClientOrTx, name: string): Promise<Plan | null>;
  findByCode(client: PrismaClientOrTx, code: string): Promise<Plan | null>;
  findPlanById(client: PrismaClientOrTx, id: string): Promise<Plan | null>;
  findAll(client: PrismaClientOrTx): Promise<Plan[]>;
  updatePlan(
    client: PrismaClientOrTx,
    {
      id,
      name,
      description,
      priceMonthly,
      maxUsers,
      maxWhatsappSessions,
      maxMonthlyAppointments,
      trialDays,
    }: IUpdatePlan,
  ): Promise<Plan>;
}
