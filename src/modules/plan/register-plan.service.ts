import { ConflictError } from "@/errors/conflict.error";
import { IPlanRepository } from "./repositories/plan-repository.interface";
import { prisma } from "@/db/prisma";

interface IPlanServiceRequest {
    name: string;
    code: string;
    priceMonthly: number;
    maxUsers?: number;
    maxWhatsappSessions?: number;
    maxMonthlyAppointments?: number;
}

export class RegisterPlanService {
    constructor(private readonly planRepository: IPlanRepository) {}
    async exec({name, code, priceMonthly, maxUsers, maxWhatsappSessions, maxMonthlyAppointments}: IPlanServiceRequest): Promise<void>{
        const doesThePlanNameExists = await this.planRepository.findByName(prisma, name)
        const doesThePlanCodeExists = await this.planRepository.findByCode(prisma, code)

        if(doesThePlanCodeExists || doesThePlanNameExists) {
            throw new ConflictError('Plan name or code already exists')
        }

        await this.planRepository.create(prisma, {
            name,
            code,
            priceMonthly,
            maxUsers,
            maxWhatsappSessions,
            maxMonthlyAppointments
        })
    }
}