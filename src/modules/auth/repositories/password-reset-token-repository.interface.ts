import { PrismaClientOrTx } from "@/types/prisma.type";

export type PasswordResetTokenRecord = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
};

export interface IPasswordResetTokenRepository {
  create(
    client: PrismaClientOrTx,
    data: {
      userId: string;
      tokenHash: string;
      expiresAt: Date;
    },
  ): Promise<PasswordResetTokenRecord>;
  findValidByTokenHash(
    client: PrismaClientOrTx,
    tokenHash: string,
  ): Promise<PasswordResetTokenRecord | null>;
  markAsUsed(
    client: PrismaClientOrTx,
    id: string,
  ): Promise<PasswordResetTokenRecord>;
  deleteUnusedByUserId(client: PrismaClientOrTx, userId: string): Promise<void>;
}
