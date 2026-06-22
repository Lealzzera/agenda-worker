import { UserRepository } from "@/modules/user/repositories/user-respository";
import { PasswordResetTokenRepository } from "../repositories/password-reset-token-repository";
import { RequestPasswordResetService } from "../request-password-reset.service";

export default function makeRequestPasswordResetServiceFactory() {
  const userRepository = new UserRepository();
  const passwordResetTokenRepository = new PasswordResetTokenRepository();

  return new RequestPasswordResetService(
    userRepository,
    passwordResetTokenRepository,
  );
}
