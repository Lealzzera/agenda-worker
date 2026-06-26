import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run the seed.");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

function getRequiredEnv(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is required to seed plans.`);
  }

  return value;
}

async function seedPlans() {
  const basicStripePriceId = getRequiredEnv("STRIPE_BASIC_PRICE_ID");
  const plusStripePriceId = getRequiredEnv("STRIPE_PLUS_PRICE_ID");

  await prisma.plan.upsert({
    where: { code: "BASIC" },
    update: {
      name: "Plano Basico",
      description: "Para clinicas que estao comecando",
      price_monthly: 14990,
      stripe_price_id: basicStripePriceId,
      trial_days: 7,
      max_users: 1,
      max_whatsapp_sessions: 1,
      max_monthly_appointments: 50,
    },
    create: {
      name: "Plano Basico",
      code: "BASIC",
      description: "Para clinicas que estao comecando",
      price_monthly: 14990,
      stripe_price_id: basicStripePriceId,
      trial_days: 7,
      max_users: 1,
      max_whatsapp_sessions: 1,
      max_monthly_appointments: 50,
    },
  });

  await prisma.plan.upsert({
    where: { code: "PLUS" },
    update: {
      name: "Plano Plus",
      description: "Para clinicas que estao crescendo",
      price_monthly: 29990,
      stripe_price_id: plusStripePriceId,
      trial_days: 7,
      max_users: 3,
      max_whatsapp_sessions: 3,
      max_monthly_appointments: null,
    },
    create: {
      name: "Plano Plus",
      code: "PLUS",
      description: "Para clinicas que estao crescendo",
      price_monthly: 29990,
      stripe_price_id: plusStripePriceId,
      trial_days: 7,
      max_users: 3,
      max_whatsapp_sessions: 3,
      max_monthly_appointments: null,
    },
  });
}

seedPlans()
  .then(() => {
    console.log("Plans seeded successfully.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
