import { ClinicMember, ClinicRole, MemberStatus } from "@prisma/client";
import { PrismaClientOrTx } from "../../../types/prisma.type";

export interface ICreateClinicMember {
  clinicId: string;
  userId: string;
  role: ClinicRole;
  status: MemberStatus
}


export interface IClinicMemberRepository {
  create(client: PrismaClientOrTx, {clinicId, userId, role, status}: ICreateClinicMember): Promise<ClinicMember>
}