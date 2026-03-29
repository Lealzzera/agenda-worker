import { Prisma, User } from "@prisma/client";
import { ICreateUser, IUserRepository } from "./user-repository.interface";
import { prisma } from "../../../db/prisma";

export class UserRepository implements IUserRepository {
    async create(tx: Prisma.TransactionClient, { full_name, email, password_hash, picture_url }: ICreateUser): Promise<User> {
        const data = await tx.user.create({
            data: {
                full_name,
                email,
                password_hash,
                picture_url,
            }
        })
        return data
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })

        return user
    }

}