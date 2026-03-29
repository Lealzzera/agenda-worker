import { Clinic } from "@prisma/client";
import { PrismaClientOrTx } from "@/types/prisma.type";

export interface ICreateClinic {
  name: string;
  slug: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  state?: string;
}

export interface IClinicRepository {
  create(client: PrismaClientOrTx, {name, slug, cnpj, phone, email, address, postalCode, city, state}: ICreateClinic): Promise<Clinic>
  findById(client: PrismaClientOrTx, id: string): Promise<Clinic | null>
}