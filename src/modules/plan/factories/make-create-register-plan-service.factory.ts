import { PlanRepository } from "../repositories/plan-repository";
import { RegisterPlanService } from "../register-plan.service";

export default function makeCreateRegisterPlanServiceFactory() {
    const planRepository = new PlanRepository()
    const createPlanService = new RegisterPlanService(planRepository)
    return createPlanService
}