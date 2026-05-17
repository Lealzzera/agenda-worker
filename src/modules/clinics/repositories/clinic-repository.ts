import { PrismaClientOrTx } from "@/types/prisma.type";
import { Clinic } from "@prisma/client";
import {
  IClinicRepository,
  ICreateClinic,
} from "./clinic-repository.interface";

export class ClinicRepository implements IClinicRepository {
  async create(
    client: PrismaClientOrTx,
    {
      name,
      cnpj,
      phone,
      slug,
      address,
      city,
      email,
      postalCode,
      state,
      type,
      stripeCustomerId,
    }: ICreateClinic,
  ): Promise<Clinic> {
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
        stripe_customer_id: stripeCustomerId,
      },
    });
    return data;
  }

  async findById(client: PrismaClientOrTx, id: string): Promise<Clinic | null> {
    const data = await client.clinic.findUnique({
      where: {
        id,
      },
    });
    return data;
  }

  async updateClinic(
    client: PrismaClientOrTx,
    id: string,
    data: Partial<Clinic>,
  ): Promise<Clinic> {
    const updatedClinic = await client.clinic.update({
      where: {
        id,
      },
      data,
    });
    return updatedClinic;
  }
}
