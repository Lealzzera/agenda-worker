import { PrismaClientOrTx } from "@/types/prisma.type";
import {
  IServiceInput,
  ISettingsInput,
  IWorkingHourInput,
} from "@/types/types";
import { ClinicType, SignupDraft, SignupDraftStatus } from "@prisma/client";

export interface SignupDraftData {
  clinicName: string;
  clinicType: ClinicType;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  state: string;
  planId: string;
  workingHours: IWorkingHourInput[];
  services: IServiceInput[];
  settings: ISettingsInput;
}

export interface CreateSignupDraft {
  email: string;
  passwordHash: string;
  fullName: string;
  selectedPlanId: string;
  data: SignupDraftData;
  stripeCheckoutSessionId?: string;
  status?: SignupDraftStatus;
  expiresAt: Date;
}

export interface ISignupDraftRepository {
  create(client: PrismaClientOrTx, data: CreateSignupDraft): Promise<SignupDraft>;
  findById(client: PrismaClientOrTx, id: string): Promise<SignupDraft | null>;
  findByStripeSessionId(client: PrismaClientOrTx, stripeSessionId: string): Promise<SignupDraft | null>;
  linkStripeSession(client: PrismaClientOrTx, draftId: string, stripeSessionId: string): Promise<void>;
}
