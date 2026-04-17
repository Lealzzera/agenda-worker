import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.create({
    data: {
      email: process.env.SEED_USER_EMAIL!,
      full_name: process.env.SEED_USER_NAME!,
      password_hash: await hash(process.env.SEED_USER_PASSWORD!, 8),
      role: process.env.SEED_USER_ROLE! as "ADMIN" | "USER",
    },
  });
  console.log(user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
