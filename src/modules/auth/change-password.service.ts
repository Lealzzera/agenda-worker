import { prisma } from "@/db/prisma";
import { BadRequestError } from "@/errors/bad-request.error";
import { IUserRepository } from "@/modules/user/repositories/user-repository.interface";
import { compare, hash } from "bcrypt";

type ChangePasswordServiceRequest = {
  userId: string;
  currentPassword: string;
  newPassword: string;
};

export class ChangePasswordService {
  constructor(private readonly userRepository: IUserRepository) {}

  async exec({
    userId,
    currentPassword,
    newPassword,
  }: ChangePasswordServiceRequest): Promise<void> {
    if (newPassword.length < 8) {
      throw new BadRequestError("Password must have at least 8 characters.");
    }

    const user = await this.userRepository.findById(prisma, userId);

    if (!user) {
      throw new BadRequestError("User not found.");
    }

    const isCurrentPasswordValid = await compare(
      currentPassword,
      user.password_hash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestError("Current password is invalid.");
    }

    const newPasswordHash = await hash(newPassword, 6);

    await this.userRepository.updatePasswordHash(
      prisma,
      user.id,
      newPasswordHash,
    );
  }
}
