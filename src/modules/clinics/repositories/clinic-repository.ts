import { Clinic } from "@prisma/client";
import { IClinicRepository, ICreateClinic } from "./clinic-repository.interface";
import { PrismaClientOrTx } from "@/types/prisma.type";

export class ClinicRepository implements IClinicRepository {
    async create(client: PrismaClientOrTx, { name, cnpj, phone, slug, address, city, email, postalCode, state, type }: ICreateClinic): Promise<Clinic> {
        const data = await client.clinic.create({
            data: {
                name,
                cnpj,
                phone,
                slug,
                address,
                city,
                email,
                postal_code: postalCode,
                state,
                type,
            }
        })
        return data
    }

    async findById(client: PrismaClientOrTx, id: string): Promise<Clinic | null> {
        const data = await client.clinic.findUnique({
            where: {
                id
            }
        })
        return data
    }
}