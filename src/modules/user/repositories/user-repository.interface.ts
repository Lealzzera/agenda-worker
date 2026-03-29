import { Prisma, User } from "@prisma/client";

export interface ICreateUser {
  full_name: string;
  email: string;
  password_hash: string;
  picture_url?: string
}

export interface IUserRepository {
    create(tx: Prisma.TransactionClient, {full_name, email, password_hash, picture_url}: ICreateUser): Promise<User>
    findByEmail(email: string): Promise<User | null>
}