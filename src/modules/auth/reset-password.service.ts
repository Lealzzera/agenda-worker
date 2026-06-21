import { prisma } from "@/db/prisma";
import { BadRequestError } from "@/errors/bad-request.error";
import { IUserRepository } from "@/modules/user/repositories/user-repository.interface";
import { hash } from "bcrypt";
import { createHash } from "node:crypto";
import { IPasswordResetTokenRepository } from "./repositories/password-reset-token-repository.interface";

type ResetPasswordServiceRequest = {
  token: string;
  password: string;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export class ResetPasswordService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
  ) {}

  async exec({ token, password }: ResetPasswordServiceRequest): Promise<void> {
    if (password.length < 8) {
      throw new BadRequestError("Password must be at least 8 characters long.");
    }

    const tokenHash = hashToken(token);
    const resetToken =
      await this.passwordResetTokenRepository.findValidByTokenHash(
        prisma,
        tokenHash,
      );

    if (!resetToken) {
      throw new BadRequestError("Invalid or expired password reset token.");
    }

    const passwordHash = await hash(password, 6);

    await prisma.$transaction(async (tx) => {
      await this.userRepository.updatePasswordHash(
        tx,
        resetToken.user_id,
        passwordHash,
      );
      await this.passwordResetTokenRepository.markAsUsed(tx, resetToken.id);
    });
  }
}
