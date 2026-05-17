import { UserRepository } from "@/modules/user/repositories/user-respository";
import { RefreshService } from "../refresh.service";

export default function makeRefreshTokenServiceFactory() {
  const userRepository = new UserRepository();
  const refreshTokenService = new RefreshService(userRepository);
  return refreshTokenService;
}
