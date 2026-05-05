import { UserRepository } from "@/modules/user/repositories/user-respository";
import { RegisterSignupDraftService } from "../register-signup-draft.service";
import { SignupDraftRepository } from "../repositories/signup-draft-repository";

export function makeRegisterSignupDraftFactory() {
  const userRepository = new UserRepository();
  const signupDraftRepository = new SignupDraftRepository();
  const registerSignupDraftService = new RegisterSignupDraftService(
    signupDraftRepository,
    userRepository,
  );
  return registerSignupDraftService;
}
