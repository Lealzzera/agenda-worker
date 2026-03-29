import { PrismaClientOrTx } from "@/types/prisma.type";
import { Plan } from "@prisma/client";

export interface ICreatePlan {
  name: string;
  code: string;
  priceMonthly: number
  maxUsers?: number
  maxWhatsappSessions?: number
  maxMonthlySchedules?: number
}

export interface IPlanRepository {
    create(client: PrismaClientOrTx, {name, code, priceMonthly, maxUsers, maxWhatsappSessions, maxMonthlySchedules}: ICreatePlan): Promise<Plan>
    findByName(client: PrismaClientOrTx, name: string): Promise<Plan | null>
    findByCode(client: PrismaClientOrTx, code: string): Promise<Plan | null>
    findPlanById(client: PrismaClientOrTx, id: string): Promise<Plan | null>
}