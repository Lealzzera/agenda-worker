import { Prisma, PrismaClient } from "@prisma/client";

export type PrismaClientOrTx = PrismaClient | Prisma.TransactionClient;
