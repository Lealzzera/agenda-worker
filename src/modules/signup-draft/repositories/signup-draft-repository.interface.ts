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
  additionalInformation?: string;
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

export interface UpdateSignupDraft {
  email?: string;
  password_hash?: string;
  full_name?: string;
  selected_plan_id?: string;
  data?: {
    clinicName?: string;
    clinicType?: ClinicType;
    phone?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    state?: string;
    additionalInformation?: string;
    planId?: string;
    workingHours?: IWorkingHourInput[];
    services?: IServiceInput[];
    settings?: ISettingsInput;
  };
  stripe_checkout_session_id?: string;
  status?: SignupDraftStatus;
}

export interface ISignupDraftRepository {
  create(
    client: PrismaClientOrTx,
    data: CreateSignupDraft,
  ): Promise<SignupDraft>;
  findById(client: PrismaClientOrTx, id: string): Promise<SignupDraft | null>;
  delete(client: PrismaClientOrTx, id: string): Promise<void>;
  updateDraft(
    client: PrismaClientOrTx,
    id: string,
    data: UpdateSignupDraft,
  ): Promise<SignupDraft>;
}
