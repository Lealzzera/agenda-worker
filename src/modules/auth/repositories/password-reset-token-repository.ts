import { PrismaClientOrTx } from "@/types/prisma.type";
import {
  IPasswordResetTokenRepository,
  PasswordResetTokenRecord,
} from "./password-reset-token-repository.interface";

export class PasswordResetTokenRepository
  implements IPasswordResetTokenRepository
{
  async create(
    client: PrismaClientOrTx,
    {
      userId,
      tokenHash,
      expiresAt,
    }: {
      userId: string;
      tokenHash: string;
      expiresAt: Date;
    },
  ): Promise<PasswordResetTokenRecord> {
    return client.passwordResetToken.create({
      data: {
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
      },
    });
  }

  async findValidByTokenHash(
    client: PrismaClientOrTx,
    tokenHash: string,
  ): Promise<PasswordResetTokenRecord | null> {
    return client.passwordResetToken.findFirst({
      where: {
        token_hash: tokenHash,
        used_at: null,
        expires_at: {
          gt: new Date(),
        },
      },
    });
  }

  async markAsUsed(
    client: PrismaClientOrTx,
    id: string,
  ): Promise<PasswordResetTokenRecord> {
    return client.passwordResetToken.update({
      where: {
        id,
      },
      data: {
        used_at: new Date(),
      },
    });
  }

  async deleteUnusedByUserId(
    client: PrismaClientOrTx,
    userId: string,
  ): Promise<void> {
    await client.passwordResetToken.deleteMany({
      where: {
        user_id: userId,
        used_at: null,
      },
    });
  }
}
