import { BadRequestError } from "@/errors/bad-request.error";
import { IUserRepository } from "./repositories/user-repository.interface";
import { prisma } from "@/db/prisma";
import { IClinicRepository } from "../clinics/repositories/clinic-repository.interface";
import { IClinicMemberRepository } from "../clinic-member/repositories/clinic-member-repository.interface";
import { hash } from "bcrypt";
import { ClinicRole } from "@prisma/client";

interface RegisterUserRequest {
    clinicId: string;
    fullName: string;
    email: string;
    password: string;
    pictureUrl?: string
    userRole: ClinicRole
}

interface RegisterUserResponse {
    user: {
        id: string;
        fullName: string;
        email: string;
        pictureUrl: string | null;
        role: ClinicRole;
    }
}

export class RegisterUserService {
    constructor(private readonly userRepository: IUserRepository, private readonly clinicRepository: IClinicRepository, private readonly clinicMemberRepository: IClinicMemberRepository) {}

    async exec({clinicId, fullName, email, password, pictureUrl, userRole}: RegisterUserRequest): Promise<RegisterUserResponse> {
        
        const doesTheClinicExist = await this.clinicRepository.findById(prisma, clinicId)

        if(!doesTheClinicExist) {
            throw new BadRequestError("Clinic not found");
        }

        const doesThePasswordLengthMatch = password.length >= 6;
        
        if(!doesThePasswordLengthMatch) {
            throw new BadRequestError("Password must be at least 6 characters long");
        }

        const doesTheEmailAlreadyExist = await this.userRepository.findByEmail(prisma, email)

        if(doesTheEmailAlreadyExist) {
            throw new BadRequestError("Email provided already exists");
        }

        const passwordHashed = await hash(password, 6)

        const { user } = await prisma.$transaction(async (tx) => {
            const user = await this.userRepository.create(tx, {
                full_name: fullName,
                email,
                password_hash: passwordHashed,
                picture_url: pictureUrl
            }) 
            await this.clinicMemberRepository.create(tx, {
                clinicId,
                userId: user.id,
                role: userRole,
                status: 'ACTIVE'
            })
            return { user }
        })
        
        return {
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                pictureUrl: user.picture_url,
                role: userRole
            }
        }
    }
}