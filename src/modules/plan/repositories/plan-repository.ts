import { Plan } from "@prisma/client";
import { ICreatePlan, IPlanRepository } from "./plan-repository.interface";
import { PrismaClientOrTx } from "@/types/prisma.type";

export class PlanRepository implements IPlanRepository {
    async create(client: PrismaClientOrTx, { name, code, priceMonthly, maxUsers, maxWhatsappSessions, maxMonthlySchedules }: ICreatePlan): Promise<Plan> {
        const data = await client.plan.create({
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

    async findByName(client: PrismaClientOrTx, name: string): Promise<Plan | null> {
        const data = await client.plan.findFirst({
            where: {
                name: name
            }
        })
        return data
    }

    async findByCode(client: PrismaClientOrTx, code: string): Promise<Plan | null> {
        const data = await client.plan.findUnique({
            where: {
                code
            }
        })
        return data
    }

    async findPlanById(client: PrismaClientOrTx, id: string): Promise<Plan | null> {
        const data = await client.plan.findUnique({
            where: {
                id
            }
        })
        return data
    }
}