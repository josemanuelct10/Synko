import path from "node:path";
import dotenv from "dotenv";
import type { StringValue } from "ms";
import { z } from "zod";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env")
});

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  BACKEND_PORT: z.coerce.number().default(3000),

  FRONTEND_URL: z.string().url().default("http://localhost:4200"),

  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z
    .custom<StringValue>((value) => typeof value === "string" && value.length > 0, {
      message: "JWT_EXPIRES_IN must be a valid ms duration string"
    })
    .default("1h"),
  SALT_ROUNDS: z.coerce.number().default(10),

  POSTGRES_HOST: z.string().default("localhost"),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_DB: z.string().default("synko"),
  POSTGRES_USER: z.string().default("synko_user"),
  POSTGRES_PASSWORD: z.string().default("synko_password"),

  DATABASE_URL: z.string().url(),

  UPLOADS_DIR: z.string().default("uploads"),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().default(10),
  
  QDRANT_URL: z.string().url().default("http://localhost:6333"),
  QDRANT_COLLECTION: z.string().default("synko_documents"),

  AI_PROVIDER: z.string().default("placeholder"),
  AI_API_KEY: z.string().default("change_me"),
  EMBEDDING_MODEL: z.string().default("placeholder"),
  CHAT_MODEL: z.string().default("placeholder"),

});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:");
  console.error(parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}



export const env = parsedEnv.data;