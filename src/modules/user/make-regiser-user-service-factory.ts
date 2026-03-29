import { ClinicMemberRepository } from "../clinic-member/repositories/clinic-member-repository";
import { ClinicRepository } from "../clinics/repositories/clinic-repository";
import { PlanRepository } from "../plan/repositories/plan-repository";
import { SubscriptionRepository } from "../subscription/repositories/subscription-repository";
import { RegisterUserService } from "./register-user.service";
import { UserRepository } from "./repositories/user-respository";

export default function makeRegisterUserServiceFactory() {
    const userRepository = new UserRepository()
    const clinicRepository = new ClinicRepository()
    const clinicMemberRepository = new ClinicMemberRepository()
    const subscriptionRepository = new SubscriptionRepository()
    const planRepository = new PlanRepository()
    const registerUserService = new RegisterUserService(userRepository, clinicRepository, clinicMemberRepository, subscriptionRepository, planRepository)
    return registerUserService
}