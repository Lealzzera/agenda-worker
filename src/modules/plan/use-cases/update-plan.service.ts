import { prisma } from "@/db/prisma";
import { BadRequestError } from "@/errors/bad-request.error";
import { IPlanRepository } from "../repositories/plan-repository.interface";

type UpdatePlanData = {
  name?: string;
  description?: string;
  priceMonthly?: number;
  maxUsers?: number;
  maxWhatsappSessions?: number;
  maxMonthlyAppointments?: number | null;
  trialDays?: number;
  stripePriceId?: string;
};

type UpdatePlanServiceRequest = {
  id: string;
  data: UpdatePlanData;
};

export class UpdatePlanService {
  constructor(private readonly planRepository: IPlanRepository) {}

  async exec({ id, data }: UpdatePlanServiceRequest) {
    const plan = await this.planRepository.findPlanById(prisma, id);

    if (!plan) {
      throw new BadRequestError("Plan not found");
    }

    await this.planRepository.updatePlan(prisma, {
      id,
      ...data,
    });
  }
}
