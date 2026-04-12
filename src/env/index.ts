import 'dotenv/config'
import z from "zod";

const envSchema = z.object( {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(3333),
    JWT_SECRET: z.string().min(10),
    FRONTEND_URL: z.url(),
    DATABASE_URL: z.url(),
    DATABASE_USER: z.string(),
    DATABASE_PASSWORD: z.string(),
    DATABASE_NAME: z.string(),
    DATABASE_PORT: z.coerce.number().default(5432),
    WAHA_URL: z.url(),
    WAHA_API_KEY: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)


if(!parsed.success) {
    console.error('Invalid environment variables', z.treeifyError(parsed.error))
    throw new Error('Invalid environment variables')
}

export const env = parsed.data