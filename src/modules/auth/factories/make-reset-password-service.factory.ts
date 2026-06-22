import { UserRepository } from "@/modules/user/repositories/user-respository";
import { PasswordResetTokenRepository } from "../repositories/password-reset-token-repository";
import { ResetPasswordService } from "../reset-password.service";

export default function makeResetPasswordServiceFactory() {
  const userRepository = new UserRepository();
  const passwordResetTokenRepository = new PasswordResetTokenRepository();

  return new ResetPasswordService(userRepository, passwordResetTokenRepository);
}
