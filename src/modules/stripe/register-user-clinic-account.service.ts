import { prisma } from "@/db/prisma";
import { makeCreateRegisterClinicServiceFactory } from "../clinics/factories/make-create-register-clinic-service.factory";
import { ISignupDraftRepository } from "../signup-draft/repositories/signup-draft-repository.interface";

type RegisterUserClinicAccountServiceRequest = {
  draftId: string;
  stripeCheckoutSessionId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
};

type RegisterUserClinicData = {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  selected_plan_id: string;
  data: {
    city: string;
    phone: string;
    state: string;
    planId: string;
    address: string;
    services: any[];
    settings: { chargesEvaluation: boolean; evaluationPriceCents: number };
    clinicName: string;
    clinicType: string;
    postalCode: string;
    workingHours: any[];
  };
  status: string;
  created_at: Date;
  updated_at: Date;
  expires_at: Date;
};

export class RegisterUserClinicAccountService {
  constructor(private readonly signupDraftRepository: ISignupDraftRepository) {}

  async exec({
    draftId,
    stripeCheckoutSessionId,
    stripeCustomerId,
    stripeSubscriptionId,
  }: RegisterUserClinicAccountServiceRequest) {
    const registerClinicService = makeCreateRegisterClinicServiceFactory();
    const draftFromDatabase = (await this.signupDraftRepository.findById(
      prisma,
      draftId,
    )) as RegisterUserClinicData | null;

    if (!draftFromDatabase) {
      throw new Error("Draft not found");
    }

    const userClinicRegistered = await registerClinicService.exec({
      clinicName: draftFromDatabase.data.clinicName,
      userFullName: draftFromDatabase.full_name,
      passwordHash: draftFromDatabase.password_hash,
      userEmail: draftFromDatabase.email,
      planId: draftFromDatabase.selected_plan_id,
      address: draftFromDatabase.data.address,
      city: draftFromDatabase.data.city,
      state: draftFromDatabase.data.state,
      postalCode: draftFromDatabase.data.postalCode,
      phone: draftFromDatabase.data.phone,
      services: draftFromDatabase.data.services,
      settings: draftFromDatabase.data.settings,
      workingHours: draftFromDatabase.data.workingHours,
      clinicType: draftFromDatabase.data.clinicType as any,
      stripeCustomerId,
      stripeSubscriptionId,
      stripeCheckoutSessionId,
    });

    await this.signupDraftRepository.delete(prisma, draftId);

    return {
      user: userClinicRegistered,
    };
  }
}
