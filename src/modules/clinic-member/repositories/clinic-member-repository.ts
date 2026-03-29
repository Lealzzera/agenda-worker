import { ClinicMember, Prisma } from "@prisma/client";
import { IClinicRepository, ICreateClinicMember } from "./clinic-member-repository.interface";

export class ClinicMemberRepository implements IClinicRepository {
    async create(tx: Prisma.TransactionClient, { clinicId, userId, role, status }: ICreateClinicMember): Promise<ClinicMember> {
        const data = await tx.clinicMember.create({
            data: {
                clinic_id: clinicId,
                user_id: userId,
                role,
                status
            }
        })
        return data
    }

}