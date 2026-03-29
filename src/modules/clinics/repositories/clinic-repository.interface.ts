import { Clinic, Prisma } from "@prisma/client";

export interface ICreateClinic {
  name: string;
  slug: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  state?: string;
}

export interface IClinicRepository {
  create(tx: Prisma.TransactionClient, {name, slug, cnpj, phone, email, address, postal_code, city, state}: ICreateClinic): Promise<Clinic>
}