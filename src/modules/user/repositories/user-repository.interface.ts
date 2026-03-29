import { User } from "@prisma/client";
import { PrismaClientOrTx } from "../../../types/prisma.type";

export interface ICreateUser {
  full_name: string;
  email: string;
  password_hash: string;
  picture_url?: string
}

export interface IUserRepository {
    create(client: PrismaClientOrTx, {full_name, email, password_hash, picture_url}: ICreateUser): Promise<User>
    findByEmail(email: string): Promise<User | null>
}