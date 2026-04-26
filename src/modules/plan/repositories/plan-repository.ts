import { PrismaClientOrTx } from "@/types/prisma.type";
import { Plan } from "@prisma/client";
import {
  ICreatePlan,
  IPlanRepository,
  IUpdatePlan,
} from "./plan-repository.interface";

export class PlanRepository implements IPlanRepository {
  async create(
    client: PrismaClientOrTx,
    {
      name,
      description,
      code,
      priceMonthly,
      maxUsers,
      maxWhatsappSessions,
      maxMonthlyAppointments,
      stripePriceId,
    }: ICreatePlan,
  ): Promise<Plan> {
    const data = await client.plan.create({
      data: {
        name,
        description,
        code,
        price_monthly: priceMonthly,
        max_users: maxUsers,
        max_whatsapp_sessions: maxWhatsappSessions,
        max_monthly_appointments: maxMonthlyAppointments,
        stripe_price_id: stripePriceId,
      },
    });
    return data;
  }

  async findByName(
    client: PrismaClientOrTx,
    name: string,
  ): Promise<Plan | null> {
    const data = await client.plan.findFirst({
      where: {
        name: name,
      },
    });
    return data;
  }

  async findByCode(
    client: PrismaClientOrTx,
    code: string,
  ): Promise<Plan | null> {
    const data = await client.plan.findUnique({
      where: {
        code,
      },
    });
    return data;
  }

  async findPlanById(
    client: PrismaClientOrTx,
    id: string,
  ): Promise<Plan | null> {
    const data = await client.plan.findUnique({
      where: {
        id,
      },
    });
    return data;
  }

  async findAll(client: PrismaClientOrTx): Promise<Plan[]> {
    const data = await client.plan.findMany();
    return data;
  }

  async updatePlan(
    client: PrismaClientOrTx,
    {
      id,
      name,
      description,
      priceMonthly,
      maxUsers,
      maxWhatsappSessions,
      maxMonthlyAppointments,
      trialDays,
      stripePriceId,
    }: IUpdatePlan,
  ): Promise<Plan> {
    const data = await client.plan.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        price_monthly: priceMonthly,
        max_users: maxUsers,
        max_whatsapp_sessions: maxWhatsappSessions,
        max_monthly_appointments: maxMonthlyAppointments,
        stripe_price_id: stripePriceId,
        trial_days: trialDays,
        updated_at: new Date(),
      },
    });
    return data;
  }
}
