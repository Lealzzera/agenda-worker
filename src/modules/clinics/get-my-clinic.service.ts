import { IClinicMemberRepository } from "../clinic-member/repositories/clinic-member-repository.interface";
import { IUserRepository } from "../user/repositories/user-repository.interface";
import { prisma } from "@/db/prisma";
import { IClinicRepository } from "./repositories/clinic-repository.interface";
import { getClinicSubscriptionAccess } from "../subscription/stripe-subscription-sync.service";

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

    let clinicFromDB = await this.clinicRepository.findById(
      prisma,
      clinicMemberFromDB.clinic_id,
    );

    if (!clinicFromDB) throw new Error("Clinic not found");

    const subscriptionAccess = await getClinicSubscriptionAccess(
      clinicMemberFromDB.clinic_id,
    );

    clinicFromDB =
      (await this.clinicRepository.findById(
        prisma,
        clinicMemberFromDB.clinic_id,
      )) ?? clinicFromDB;

    return {
      clinicId: clinicMemberFromDB.clinic_id,
      clinic: clinicFromDB,
      subscription: subscriptionAccess.subscription,
      hasSubscriptionAccess: subscriptionAccess.allowed,
      role: clinicMemberFromDB.role,
      globalUserRole: userFromDB.role,
    };
  }
}
