import { prisma } from "@/db/prisma";
import { BadRequestError } from "@/errors/bad-request.error";
import { IPlanRepository } from "@/modules/plan/repositories/plan-repository.interface";
import { RegistrationDraft } from "@prisma/client";
import { IRegistrationDraftRepository } from "../repositories/registration-draft-repository.interface";

export interface ISaveRegistrationDraftRequest {
  userFullName: string;
  userEmail: string;
  password: string;
  userPictureUrl?: string;
  clinicName: string;
  clinicType?: string;
  cnpj?: string;
  phone?: string;
  clinicEmail?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  state?: string;
  planId: string;
  workingHours?: { weekday: string; startTime: string; endTime: string }[];
  services?: { name: string; durationMinutes: number; priceCents?: number }[];
  settings?: { chargesEvaluation?: boolean; evaluationPriceCents?: number };
}

export class SaveRegistrationDraftService {
  constructor(
    private readonly draftRepository: IRegistrationDraftRepository,
    private readonly planRepository: IPlanRepository
  ) {}

  async exec(data: ISaveRegistrationDraftRequest): Promise<RegistrationDraft> {
    const plan = await this.planRepository.findPlanById(prisma, data.planId);

    if (!plan) {
      throw new BadRequestError("Plan id provided not found.");
    }

    // Draft expira em 2 horas — tempo suficiente para completar o checkout
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    return this.draftRepository.upsert(prisma, {
      email: data.userEmail,
      payload: data,
      expiresAt,
    });
  }
}
