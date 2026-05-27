import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { env } from "../../config/env.js";

const connectionString = `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}?schema=public`;

const adapter = new PrismaPg({
  connectionString
});

export const prisma = new PrismaClient({
  adapter
});