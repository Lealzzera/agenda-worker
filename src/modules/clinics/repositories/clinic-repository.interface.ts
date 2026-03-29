import { Clinic, Prisma } from "@prisma/client";

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
  create(tx: Prisma.TransactionClient, {name, slug, cnpj, phone, email, address, postalCode, city, state}: ICreateClinic): Promise<Clinic>
}