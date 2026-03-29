import { PlanRepository } from "@/modules/plan/repositories/plan-repository";
import { RegisterPlanService } from "@/modules/plan/register-plan.service";

export default function makeCreateRegisterPlanServiceFactory() {
    const planRepository = new PlanRepository()
    const createPlanService = new RegisterPlanService(planRepository)
    return createPlanService
}