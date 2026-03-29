import { PlanService } from "../plan.service";
import { PlanRepository } from "../repositories/plan-repository";

export default function makeCreatePlanService() {
    const planRepository = new PlanRepository()
    const createPlanService = new PlanService(planRepository)
    return createPlanService
}