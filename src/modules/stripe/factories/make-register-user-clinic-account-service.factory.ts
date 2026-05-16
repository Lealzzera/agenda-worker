import { SignupDraftRepository } from "@/modules/signup-draft/repositories/signup-draft-repository";
import { RegisterUserClinicAccountService } from "../register-user-clinic-account.service";

export default function makeRegisterUserClinicAccountServiceFactory() {
  const signupDraftRepository = new SignupDraftRepository();
  const registerUserClinicAccountService = new RegisterUserClinicAccountService(
    signupDraftRepository,
  );
  return registerUserClinicAccountService;
}
