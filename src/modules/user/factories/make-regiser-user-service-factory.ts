import { ClinicRepository } from "@/modules/clinics/repositories/clinic-repository"
import { UserRepository } from "../repositories/user-respository"
import { ClinicMemberRepository } from "@/modules/clinic-member/repositories/clinic-member-repository"
import { SubscriptionRepository } from "@/modules/subscription/repositories/subscription-repository"
import { PlanRepository } from "@/modules/plan/repositories/plan-repository"
import { RegisterUserService } from "../register-user.service"

export default function makeRegisterUserServiceFactory() {
    const userRepository = new UserRepository()
    const clinicRepository = new ClinicRepository()
    const clinicMemberRepository = new ClinicMemberRepository()
    const subscriptionRepository = new SubscriptionRepository()
    const planRepository = new PlanRepository()
    const registerUserService = new RegisterUserService(userRepository, clinicRepository, clinicMemberRepository, subscriptionRepository, planRepository)
    return registerUserService
}