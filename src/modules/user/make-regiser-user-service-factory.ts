import { ClinicMemberRepository } from "../clinic-member/repositories/clinic-member-repository";
import { ClinicRepository } from "../clinics/repositories/clinic-repository";
import { RegisterUserService } from "./register-user.service";
import { UserRepository } from "./repositories/user-respository";

export default function makeRegisterUserServiceFactory() {
    const userRepository = new UserRepository()
    const clinicRepository = new ClinicRepository()
    const clinicMemberRepository = new ClinicMemberRepository()
    const registerUserService = new RegisterUserService(userRepository, clinicRepository, clinicMemberRepository)
    return registerUserService
}