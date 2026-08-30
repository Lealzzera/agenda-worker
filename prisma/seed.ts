import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run the seed.");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

type PlanSeedConfig = {
  code: "BASIC" | "PLUS";
  name: string;
  description: string;
  priceMonthly: number;
  stripePriceEnv: "STRIPE_BASIC_PRICE_ID" | "STRIPE_PLUS_PRICE_ID";
  stripeLookupKey: string;
  trialDays: number;
  maxUsers: number;
  maxWhatsappSessions: number;
  maxMonthlyAppointments: number | null;
};

async function resolveStripePriceId(
  stripe: Stripe,
  plan: PlanSeedConfig,
): Promise<string> {
  const configuredPriceId = process.env[plan.stripePriceEnv];

  if (configuredPriceId) {
    return configuredPriceId;
  }

  const existingPrices = await stripe.prices.list({
    active: true,
    lookup_keys: [plan.stripeLookupKey],
    limit: 1,
  });

  if (existingPrices.data[0]) {
    return existingPrices.data[0].id;
  }

  const product = await stripe.products.create({
    name: plan.name,
    description: plan.description,
    metadata: {
      planCode: plan.code,
    },
  });

  const price = await stripe.prices.create({
    product: product.id,
    currency: "brl",
    unit_amount: plan.priceMonthly,
    recurring: {
      interval: "month",
    },
    lookup_key: plan.stripeLookupKey,
  });

  return price.id;
}

async function seedPlans() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is required to seed plans.");
  }

  const stripe = new Stripe(stripeSecretKey);
  const plans: PlanSeedConfig[] = [
    {
      code: "BASIC",
      name: "Plano Basico",
      description: "Para clinicas que estao comecando",
      priceMonthly: 14990,
      stripePriceEnv: "STRIPE_BASIC_PRICE_ID",
      stripeLookupKey: "blink_basic_monthly",
      trialDays: 3,
      maxUsers: 1,
      maxWhatsappSessions: 1,
      maxMonthlyAppointments: 50,
    },
    {
      code: "PLUS",
      name: "Plano Plus",
      description: "Para clinicas que estao crescendo",
      priceMonthly: 29990,
      stripePriceEnv: "STRIPE_PLUS_PRICE_ID",
      stripeLookupKey: "blink_plus_monthly",
      trialDays: 3,
      maxUsers: 3,
      maxWhatsappSessions: 3,
      maxMonthlyAppointments: null,
    },
  ];

  for (const plan of plans) {
    const stripePriceId = await resolveStripePriceId(stripe, plan);

    await prisma.plan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        description: plan.description,
        price_monthly: plan.priceMonthly,
        stripe_price_id: stripePriceId,
        trial_days: plan.trialDays,
        max_users: plan.maxUsers,
        max_whatsapp_sessions: plan.maxWhatsappSessions,
        max_monthly_appointments: plan.maxMonthlyAppointments,
      },
      create: {
        name: plan.name,
        code: plan.code,
        description: plan.description,
        price_monthly: plan.priceMonthly,
        stripe_price_id: stripePriceId,
        trial_days: plan.trialDays,
        max_users: plan.maxUsers,
        max_whatsapp_sessions: plan.maxWhatsappSessions,
        max_monthly_appointments: plan.maxMonthlyAppointments,
      },
    });
  }
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
