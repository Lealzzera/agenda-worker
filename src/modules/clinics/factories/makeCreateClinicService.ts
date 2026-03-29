import { ClinicMemberRepository } from "../../clinic-member/repositories/clinic-member-repository";
import { SubscriptionRepository } from "../../subscription/repositories/subscription-repository";
import { UserRepository } from "../../user/repositories/user-respository";
import { RegisterClinicService } from "../register.service";
import { ClinicRepository } from "../repositories/clinic-repository";

export function makeCreateClinicService() {
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