import { prisma } from "@/db/prisma";
import { ConflictError } from "@/errors/conflict.error";
import { IPlanRepository } from "../repositories/plan-repository.interface";

interface IPlanServiceRequest {
  name: string;
  description?: string;
  code: string;
  priceMonthly: number;
  maxUsers?: number;
  maxWhatsappSessions?: number;
  maxMonthlyAppointments?: number | null;
  stripePriceId: string;
}

export class RegisterPlanService {
  constructor(private readonly planRepository: IPlanRepository) {}
  async exec({
    name,
    description,
    code,
    priceMonthly,
    maxUsers,
    maxWhatsappSessions,
    maxMonthlyAppointments,
    stripePriceId,
  }: IPlanServiceRequest): Promise<void> {
    const doesThePlanNameExists = await this.planRepository.findByName(
      prisma,
      name,
    );
    const doesThePlanCodeExists = await this.planRepository.findByCode(
      prisma,
      code,
    );

    if (doesThePlanCodeExists || doesThePlanNameExists) {
      throw new ConflictError("Plan name or code already exists");
    }

    await this.planRepository.create(prisma, {
      name,
      description,
      code,
      priceMonthly,
      maxUsers,
      maxWhatsappSessions,
      maxMonthlyAppointments,
      stripePriceId,
    });
  }
}
