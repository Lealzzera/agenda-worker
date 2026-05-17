import { PrismaClientOrTx } from "@/types/prisma.type";
import { Clinic, ClinicType } from "@prisma/client";

export interface ICreateClinic {
  name: string;
  slug: string;
  type?: ClinicType;
  cnpj?: string;
  phone?: string;
  email?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  state?: string;
  stripeCustomerId?: string;
}

export interface IClinicRepository {
  create(
    client: PrismaClientOrTx,
    {
      name,
      slug,
      type,
      cnpj,
      phone,
      email,
      address,
      postalCode,
      city,
      state,
      stripeCustomerId,
    }: ICreateClinic,
  ): Promise<Clinic>;
  findById(client: PrismaClientOrTx, id: string): Promise<Clinic | null>;
}
