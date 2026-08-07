import { PrismaClientOrTx } from "@/types/prisma.type";
import { User } from "@prisma/client";

export interface ICreateUser {
  full_name: string;
  email: string;
  password_hash: string;
  picture_url?: string;
  acceptedTerms: boolean;
}

export interface IUserRepository {
  create(
    client: PrismaClientOrTx,
    {
      full_name,
      email,
      password_hash,
      picture_url,
      acceptedTerms,
    }: ICreateUser,
  ): Promise<User>;
  findByEmail(client: PrismaClientOrTx, email: string): Promise<User | null>;
  findById(client: PrismaClientOrTx, id: string): Promise<User | null>;
  updatePasswordHash(
    client: PrismaClientOrTx,
    userId: string,
    passwordHash: string,
  ): Promise<User>;
}
