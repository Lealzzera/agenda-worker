import { ClinicMember, ClinicRole, MemberStatus, Prisma } from "@prisma/client";

export interface ICreateClinicMember {
  clinicId: string;
  userId: string;
  role: ClinicRole;
  status: MemberStatus
}


export interface IClinicRepository {
  create(tx: Prisma.TransactionClient, {clinicId, userId, role, status}: ICreateClinicMember): Promise<ClinicMember>
}