import { prisma } from "@/db/prisma";
import { NotFoundError } from "@/errors/not-found.error";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/jwt";
import { IUserRepository } from "../user/repositories/user-repository.interface";

export class RefreshService {
  constructor(private userRepository: IUserRepository) {}
  async exec(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);
    const userId = decoded.sub;
    const user = await this.userRepository.findById(prisma, userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const newAccessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    const newRefreshToken = signRefreshToken({ sub: user.id });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
