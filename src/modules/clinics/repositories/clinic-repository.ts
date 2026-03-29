import { Clinic, Prisma } from "@prisma/client";
import { IClinicRepository, ICreateClinic } from "./clinic-repository.interface";

export class ClinicRepository implements IClinicRepository {
    async create(tx: Prisma.TransactionClient, { name, cnpj, phone, slug, address, city, email, postalCode, state  }: ICreateClinic): Promise<Clinic> {
        const data = await tx.clinic.create({
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