import { Plan } from "@prisma/client";
import { ICreatePlan, IPlanRepository } from "./plan-repository.interface";
import { prisma } from "@/db/prisma";

export class PlanRepository implements IPlanRepository {
    async create({ name, code, priceMonthly, maxUsers, maxWhatsappSessions, maxMonthlySchedules }: ICreatePlan): Promise<Plan> {
        const data = await prisma.plan.create({
            data: {
                name,
                code,
                price_monthly: priceMonthly,
                max_users: maxUsers,
                max_whatsapp_sessions: maxWhatsappSessions,
                max_monthly_schedules: maxMonthlySchedules
            }
        })
        return data
    }

    async findByName(name: string): Promise<Plan | null> {
        const data = await prisma.plan.findFirst({
            where: {
                name: name
            }
        })
        return data
    }

    async findByCode(code: string): Promise<Plan | null> {
        const data = await prisma.plan.findUnique({
            where: {
                code
            }
        })
        return data
    }

}