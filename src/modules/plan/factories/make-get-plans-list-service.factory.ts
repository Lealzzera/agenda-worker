import { PlanRepository } from "../repositories/plan-repository";
import { GetPlansListService } from "../use-cases/get-plans-list.service";

export function makeGetPlansListServiceFactory() {
  const planRepository = new PlanRepository();
  const getPlansListService = new GetPlansListService(planRepository);
  return getPlansListService;
}
