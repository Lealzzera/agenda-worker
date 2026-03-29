import { ClinicMemberRepository } from "@/modules/clinic-member/repositories/clinic-member-repository";
import { SubscriptionRepository } from "@/modules/subscription/repositories/subscription-repository";
import { UserRepository } from "@/modules/user/repositories/user-respository";
import { RegisterClinicService } from "@/modules/clinics/register-clinic.service";
import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository";

export function makeCreateRegisterClinicServiceFactory() {
    const clinicRepository = new ClinicRepository()
    const userRepository = new UserRepository()
    const clinicMemberRepository = new ClinicMemberRepository()
    const subscriptionRepository = new SubscriptionRepository()

    const clinicService = new RegisterClinicService(
        clinicRepository,
        userRepository,
        clinicMemberRepository,
        subscriptionRepository
    )
    return clinicService
}