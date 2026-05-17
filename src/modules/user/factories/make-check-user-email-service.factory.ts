import { CheckUserEmailService } from "../check-user-email.service";
import { UserRepository } from "../repositories/user-respository";

export default function makeCheckUserEmailServiceFactory() {
  const userRepository = new UserRepository();
  return new CheckUserEmailService(userRepository);
}
