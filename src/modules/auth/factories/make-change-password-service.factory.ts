import { UserRepository } from "@/modules/user/repositories/user-respository";
import { ChangePasswordService } from "../change-password.service";

export default function makeChangePasswordServiceFactory() {
  const userRepository = new UserRepository();

  return new ChangePasswordService(userRepository);
}
