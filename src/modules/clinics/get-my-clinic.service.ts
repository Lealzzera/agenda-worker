import { IClinicMemberRepository } from "../clinic-member/repositories/clinic-member-repository.interface";
import { IUserRepository } from "../user/repositories/user-repository.interface";
import { prisma } from "@/db/prisma";
import { IClinicRepository } from "./repositories/clinic-repository.interface";

export class GetMyClinicService {
  constructor(
    private readonly clinicMemberRepository: IClinicMemberRepository,
    private readonly userRepository: IUserRepository,
    private readonly clinicRepository: IClinicRepository,
  ) {}
  async exec(userId: string) {
    const userFromDB = await this.userRepository.findById(prisma, userId);

    if (!userFromDB) throw new Error("User not found");

    const clinicMemberFromDB =
      await this.clinicMemberRepository.findUserByClinicAndUserId(
        prisma,
        userId,
      );

    if (!clinicMemberFromDB) throw new Error("Clinic member not found");

    const clinicFromDB = await this.clinicRepository.findById(
      prisma,
      clinicMemberFromDB.clinic_id,
    );

    if (!clinicFromDB) throw new Error("Clinic not found");

    return {
      clinicId: clinicMemberFromDB.clinic_id,
      clinic: clinicFromDB.name,
      role: clinicMemberFromDB.role,
      globalUserRole: userFromDB.role,
    };
  }
}
