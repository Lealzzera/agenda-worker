import { prisma } from "@/db/prisma";
import { IPlanRepository } from "../repositories/plan-repository.interface";

type GetPlansListServiceResponse = {
  plans: {
    id: string;
    name: string;
    description: string | null;
    code: string;
    priceMonthly: number;
    trialDays: number;
    maxUsers: number | null;
    maxWhatsappSessions: number | null;
    maxMonthlyAppointments: number | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
};

export class GetPlansListService {
  constructor(private readonly planRepository: IPlanRepository) {}

  async exec(): Promise<GetPlansListServiceResponse | null> {
    const plans = await this.planRepository.findAll(prisma);
    const plansFormatted = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      code: plan.code,
      priceMonthly: plan.price_monthly,
      maxUsers: plan.max_users,
      maxWhatsappSessions: plan.max_whatsapp_sessions,
      maxMonthlyAppointments: plan.max_monthly_appointments,
      trialDays: plan.trial_days,
      createdAt: plan.created_at,
      updatedAt: plan.updated_at,
    }));

    return { plans: plansFormatted };
  }
}
