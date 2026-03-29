import { User } from "@prisma/client";
import { ICreateUser, IUserRepository } from "./user-repository.interface";
import { prisma } from "../../../db/prisma";
import { PrismaClientOrTx } from "../../../types/prisma.type";

export class UserRepository implements IUserRepository {
    async create(client: PrismaClientOrTx, { full_name, email, password_hash, picture_url }: ICreateUser): Promise<User> {
        const data = await client.user.create({
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