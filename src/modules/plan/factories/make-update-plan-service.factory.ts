import { PlanRepository } from "../repositories/plan-repository";
import { UpdatePlanService } from "../use-cases/update-plan.service";

export function makeUpdatePlanServiceFactory() {
  const planRepository = new PlanRepository();
  return new UpdatePlanService(planRepository);
}
