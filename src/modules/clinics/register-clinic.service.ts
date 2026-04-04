import { IClinicMemberRepository } from "@/modules/clinic-member/repositories/clinic-member-repository.interface";
import { IUserRepository } from "@/modules/user/repositories/user-repository.interface";
import { IClinicRepository } from "@/modules/clinics/repositories/clinic-repository.interface";
import { ISubscriptionRepository } from "@/modules/subscription/repositories/subscription-repository.interface";
import { IClinicSettingsRepository } from "@/modules/clinic-settings/repositories/clinic-settings-repository.interface";
import { IClinicWorkingHourRepository } from "@/modules/clinic-working-hour/repositories/clinic-working-hour-repository.interface";
import { IClinicServiceRepository } from "@/modules/clinic-service/repositories/clinic-service-repository.interface";
import { prisma } from "@/db/prisma";
import { ClinicRole, ClinicType, MemberStatus, SubscriptionStatus, Weekday } from "@prisma/client";
import { ConflictError } from "@/errors/conflict.error";
import { hash } from "bcrypt";
import { randomUUID } from "crypto";

interface IWorkingHourInput {
    weekday: Weekday;
    startTime: string;
    endTime: string;
}

interface IServiceInput {
    name: string;
    durationMinutes: number;
    priceCents?: number;
}

interface ISettingsInput {  
    chargesEvaluation?: boolean;
    evaluationPriceCents?: number;
    maxAppointmentsPerSlot?: number;
    appointmentDurationMinutes?: number;
    allowRescheduling?: boolean;
    allowCancellation?: boolean;
    timezone?: string;
    aiAgentName?: string;
}

interface IRegisterClinicRequest {
    userFullName: string;
    userEmail: string;
    password: string;
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
    ) {}

    async exec({
        userFullName,
        userEmail,
        password,
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
    }: IRegisterClinicRequest): Promise<void> {
        const doesTheUserExist = await this.userRepository.findByEmail(prisma, userEmail);
        if (doesTheUserExist) {
            throw new ConflictError('Email provided already exists.');
        }

        const baseClinicSlug = clinicName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const clinicSlug = baseClinicSlug.concat('-' + randomUUID().slice(0, 6));
        const passwordHash = await hash(password, 6);
        const trialEndsDate = new Date().setDate(new Date().getDate() + 14);

        await prisma.$transaction(async (tx) => {
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
                trialEndsAt: new Date(trialEndsDate),
            });
            if (settings) {
                await this.clinicSettingsRepository.create(tx, {
                    clinicId: clinic.id,
                    chargesEvaluation: settings.chargesEvaluation ?? false,
                    evaluationPriceCents: settings.chargesEvaluation ? settings.evaluationPriceCents : 0,
                    maxAppointmentsPerSlot: settings.maxAppointmentsPerSlot,
                    appointmentDurationMinutes: settings.appointmentDurationMinutes,
                    allowRescheduling: settings.allowRescheduling,
                    allowCancellation: settings.allowCancellation,
                    timezone: settings.timezone,
                    aiAgentName: settings.aiAgentName,
                });
            }

            if (workingHours?.length) {
                await this.clinicWorkingHourRepository.createMany(
                    tx,
                    clinic.id,
                    workingHours
                );
            }

            if (services?.length) {
                await this.clinicServiceRepository.createMany(
                    tx,
                    clinic.id,
                    services
                );
            }
        });
    }
}