import "dotenv/config";
import z from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(3333),
  JWT_SECRET: z.string().min(10),
  FRONTEND_URL: z.url(),
  DATABASE_URL: z.url(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string(),
  DATABASE_PORT: z.coerce.number().default(5432),
  WAHA_URL: z.url(),
  WAHA_API_KEY: z.string(),
  WAHA_WEBHOOK_URL: z.url(),
  WAHA_WEBHOOK_SECRET: z.string(),
  WAHA_EDITION: z.enum(["core", "plus"]).default("plus"),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-5.2"),
  AI_WORKER_ENABLED: z.coerce.boolean().default(true),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  COOKIE_SECRET: z.string(),
  MAILPIT_PORT: z.coerce.number().default(1025),
  MAILPIT_WEB_PORT: z.coerce.number().default(8025),
  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("Blink <no-reply@blink.local>"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
