import { Clinic } from "@prisma/client";
import { IClinicRepository, ICreateClinic } from "./clinic-repository.interface";
import { PrismaClientOrTx } from "@/types/prisma.type";

export class ClinicRepository implements IClinicRepository {
    async create(client: PrismaClientOrTx, { name, cnpj, phone, slug, address, city, email, postalCode, state  }: ICreateClinic): Promise<Clinic> {
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
            }
        })
        return data
    }

}