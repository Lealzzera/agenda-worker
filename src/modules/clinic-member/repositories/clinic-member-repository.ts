import { ClinicMember } from "@prisma/client";
import { IClinicMemberRepository, ICreateClinicMember } from "./clinic-member-repository.interface";
import { PrismaClientOrTx } from "@/types/prisma.type";

export class ClinicMemberRepository implements IClinicMemberRepository {
    async create(client: PrismaClientOrTx, { clinicId, userId, role, status }: ICreateClinicMember): Promise<ClinicMember> {
        const data = await client.clinicMember.create({
            data: {
                clinic_id: clinicId,
                user_id: userId,
                role,
                status
            }
        })
        return data
    }

    async findUserByClinicAndUserId(client: PrismaClientOrTx, clinicId: string, userId: string): Promise<ClinicMember | null> {
        const data = await client.clinicMember.findFirst({
            where: {
                clinic_id: clinicId,
                user_id: userId
            }
        })
        return data
    }

    async countMembersByClinicId(client: PrismaClientOrTx, clinicId: string): Promise<number> {
        const data = await client.clinicMember.count({
            where: {
                clinic_id: clinicId
            }
        })
        return data
    }
}