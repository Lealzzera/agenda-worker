import { IClinicMemberRepository } from "@/modules/clinic-member/repositories/clinic-member-repository.interface";
import { IUserRepository } from "@/modules/user/repositories/user-repository.interface";
import { IClinicRepository } from "@/modules/clinics/repositories/clinic-repository.interface";
import { ISubscriptionRepository } from "@/modules/subscription/repositories/subscription-repository.interface";
import { prisma } from "@/db/prisma";
import { ClinicRole, MemberStatus, SubscriptionStatus } from "@prisma/client";
import { ConflictError } from "@/errors/conflict.error";
import { hash } from "bcrypt";
import { randomUUID } from "crypto";

interface IRegisterClinicRequest {
    userFullName: string,
    userEmail: string,
    password: string,
    userPictureUrl?: string,
    clinicName: string;
    cnpj?: string;
    phone?: string;
    clinicEmail?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    state?: string;
    planId: string;
}

export class RegisterClinicService {
    constructor(
        private readonly clinicRepository: IClinicRepository, 
        private readonly userRepository: IUserRepository, 
        private readonly clinicMemberRepository: IClinicMemberRepository,
        private readonly subscriptionRepository: ISubscriptionRepository
    ) {}
    
    async exec({
        userFullName,
        userEmail,
        password,
        userPictureUrl,
        clinicName,
        cnpj,
        phone,
        clinicEmail,
        address,
        postalCode,
        city,
        state,
        planId,
        
    }: IRegisterClinicRequest): Promise<void> {
        const doesTheUserExist = await this.userRepository.findByEmail(prisma, userEmail)
        if (doesTheUserExist) {
            throw new ConflictError('Email provided already exists.')
        }

        const baseClinicSlug = clinicName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const clinicSlug = baseClinicSlug.concat('-' + randomUUID().slice(0, 6))
        const passwordHash = await hash(password, 6);
        const trialEndsDate = new Date().setDate(new Date().getDate() + 14)

        await prisma.$transaction(async (tx) => {
            const user = await this.userRepository.create(tx, {
                full_name: userFullName,
                email: userEmail,
                password_hash: passwordHash,
                picture_url: userPictureUrl
            });
            const clinic = await this.clinicRepository.create(tx, {
                name: clinicName,
                slug: clinicSlug,
                address: address,
                postalCode: postalCode,
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
                status: MemberStatus.ACTIVE
            });
            await this.subscriptionRepository.create(tx, {
                clinicId: clinic.id,
                planId: planId,
                status: SubscriptionStatus.TRIALING,
                trialEndsAt: new Date(trialEndsDate),
            });
        });
    }
}