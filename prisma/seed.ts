import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.create({
    data: {
      email: process.env.SEED_USER_EMAIL!,
      full_name: process.env.SEED_USER_NAME!,
      password_hash: await hash(process.env.SEED_USER_PASSWORD!, 8),
      role: process.env.SEED_USER_ROLE! as "ADMIN" | "USER",
    },
  });

  await prisma.plan.create({
    data: {
      name: "Plano Básico",
      code: "BASIC",
      description: "Para clínicas que estão começando",
      price_monthly: 9999,
      stripe_price_id: "price_1TNIa1JYnqXS5Trlz8SgLCQ5",
    },
  });

  await prisma.plan.create({
    data: {
      name: "Plano Plus",
      code: "PLUS",
      description: "Para clínicas que estão crescendo",
      price_monthly: 14999,
      stripe_price_id: "price_1TNIazJYnqXS5TrlJ8zMig0R",
      max_users: 3,
      max_whatsapp_sessions: 3,
      max_monthly_appointments: null,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
