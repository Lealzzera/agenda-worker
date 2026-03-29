import { ConflictError } from "../../errors/conflict.error";
import { IPlanRepository } from "./repositories/plan-repository.interface";

interface IPlanServiceRequest {
    name: string;
    code: string;
    priceMonthly: number;
    maxUsers?: number;
    maxWhatsappSessions?: number;
    maxMonthlySchedules?: number;
}

export class RegisterPlanService {
    constructor(private readonly planRepository: IPlanRepository) {}
    async exec({name, code, priceMonthly, maxUsers, maxWhatsappSessions, maxMonthlySchedules}: IPlanServiceRequest): Promise<void>{
        const doesThePlanNameExists = await this.planRepository.findByName(name)
        const doesThePlanCodeExists = await this.planRepository.findByCode(code)

        if(doesThePlanCodeExists || doesThePlanNameExists) {
            throw new ConflictError('Plan name or code already exists')
        }

        await this.planRepository.create({
            name,
            code,
            priceMonthly,
            maxUsers,
            maxWhatsappSessions,
            maxMonthlySchedules
        })
    }
}