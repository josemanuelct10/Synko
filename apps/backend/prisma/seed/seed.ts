import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env")
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl
});

const prisma = new PrismaClient({
  adapter
});

async function main() {
  await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: {
      name: "user",
      description: "Default user role"
    }
  });

  await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      description: "Administrator role"
    }
  });

  console.log("Seed completed successfully");
}

main()
  .catch((error) => {
    console.error("Seed failed");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });