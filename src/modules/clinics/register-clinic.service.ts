import { prisma } from "@/db/prisma";
import { BadRequestError } from "@/errors/bad-request.error";
import { ConflictError } from "@/errors/conflict.error";
import { IClinicMemberRepository } from "@/modules/clinic-member/repositories/clinic-member-repository.interface";
import { IClinicServiceRepository } from "@/modules/clinic-service/repositories/clinic-service-repository.interface";
import { IClinicSettingsRepository } from "@/modules/clinic-settings/repositories/clinic-settings-repository.interface";
import { IClinicWorkingHourRepository } from "@/modules/clinic-working-hour/repositories/clinic-working-hour-repository.interface";
import { IClinicRepository } from "@/modules/clinics/repositories/clinic-repository.interface";
import { ISubscriptionRepository } from "@/modules/subscription/repositories/subscription-repository.interface";
import { IUserRepository } from "@/modules/user/repositories/user-repository.interface";
import {
  IServiceInput,
  ISettingsInput,
  IWorkingHourInput,
} from "@/types/types";
import {
  ClinicRole,
  ClinicType,
  MemberStatus,
  SubscriptionStatus,
} from "@prisma/client";
import { hash } from "bcrypt";
import { randomUUID } from "crypto";
import { IPlanRepository } from "../plan/repositories/plan-repository.interface";

interface IRegisterClinicRequest {
  userFullName: string;
  userEmail: string;
  password?: string;
  passwordHash?: string;
  userPictureUrl?: string;
  clinicName: string;
  clinicType?: ClinicType;
  cnpj?: string;
  phone?: string;
  clinicEmail?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  state?: string;
  planId: string;
  workingHours?: IWorkingHourInput[];
  services?: IServiceInput[];
  settings?: ISettingsInput;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeCheckoutSessionId?: string;
  lastStripeInvoiceId?: string;
}

export class RegisterClinicService {
  constructor(
    private readonly clinicRepository: IClinicRepository,
    private readonly userRepository: IUserRepository,
    private readonly clinicMemberRepository: IClinicMemberRepository,
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly clinicSettingsRepository: IClinicSettingsRepository,
    private readonly clinicWorkingHourRepository: IClinicWorkingHourRepository,
    private readonly clinicServiceRepository: IClinicServiceRepository,
    private readonly planRepository: IPlanRepository,
  ) {}

  async exec({
    userFullName,
    userEmail,
    password,
    passwordHash: preHashedPassword,
    userPictureUrl,
    clinicName,
    clinicType,
    cnpj,
    phone,
    clinicEmail,
    address,
    postalCode,
    city,
    state,
    planId,
    workingHours,
    services,
    settings,
    stripeCustomerId,
    stripeSubscriptionId,
    stripeCheckoutSessionId,
    lastStripeInvoiceId,
  }: IRegisterClinicRequest): Promise<{ userId: string; clinicId: string }> {
    if (!password && !preHashedPassword) {
      throw new BadRequestError("Password or passwordHash is required.");
    }
    if (password && password.length < 8) {
      throw new BadRequestError("Password must be at least 8 characters long.");
    }

    const doesTheUserExist = await this.userRepository.findByEmail(
      prisma,
      userEmail,
    );
    if (doesTheUserExist) {
      throw new ConflictError("Email provided already exists.");
    }

    const doesThePlanExist = await this.planRepository.findPlanById(
      prisma,
      planId,
    );
    if (!doesThePlanExist) {
      throw new BadRequestError("Plan id provided not found.");
    }

    const baseClinicSlug = clinicName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const clinicSlug = baseClinicSlug.concat("-" + randomUUID().slice(0, 6));

    const passwordHash = preHashedPassword ?? (await hash(password!, 6));

    const trialEndsDate = new Date();
    trialEndsDate.setDate(
      trialEndsDate.getDate() + doesThePlanExist.trial_days,
    );
    const currentPeriodStart = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const user = await this.userRepository.create(tx, {
        full_name: userFullName,
        email: userEmail,
        password_hash: passwordHash,
        picture_url: userPictureUrl,
      });

      const clinic = await this.clinicRepository.create(tx, {
        name: clinicName,
        slug: clinicSlug,
        type: clinicType,
        address,
        postalCode,
        city,
        cnpj,
        email: clinicEmail,
        phone,
        state,
        stripeCustomerId,
      });

      await this.clinicMemberRepository.create(tx, {
        clinicId: clinic.id,
        userId: user.id,
        role: ClinicRole.OWNER,
        status: MemberStatus.ACTIVE,
      });

      await this.subscriptionRepository.create(tx, {
        clinicId: clinic.id,
        planId,
        status: SubscriptionStatus.TRIALING,
        trialEndsAt: trialEndsDate,
        currentPeriodStart,
        currentPeriodEnd: trialEndsDate,
        stripeSubscriptionId,
        stripeCheckoutSessionId,
        lastStripeInvoiceId,
      });

      if (settings) {
        await this.clinicSettingsRepository.create(tx, {
          clinicId: clinic.id,
          chargesEvaluation: settings.chargesEvaluation ?? false,
          evaluationPriceCents: settings.chargesEvaluation
            ? settings.evaluationPriceCents
            : 0,
        });
      }

      if (workingHours?.length) {
        await this.clinicWorkingHourRepository.createMany(
          tx,
          clinic.id,
          workingHours,
        );
      }

      if (services?.length) {
        await this.clinicServiceRepository.createMany(tx, clinic.id, services);
      }

      return { userId: user.id, clinicId: clinic.id };
    });

    return result;
  }
}
