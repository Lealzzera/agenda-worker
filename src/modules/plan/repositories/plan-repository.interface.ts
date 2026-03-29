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
    create({name, code, priceMonthly, maxUsers, maxWhatsappSessions, maxMonthlySchedules}: ICreatePlan): Promise<Plan>
    findByName(name: string): Promise<Plan | null>
    findByCode(code: string): Promise<Plan | null>
}