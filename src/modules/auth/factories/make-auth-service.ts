import { UserRepository } from "../../user/repositories/user-respository";
import { AuthService } from "../auth.service";

export default function makeAuthService() {
    const userRepository = new UserRepository()
    const authService = new AuthService(userRepository)
    return authService
}