import dotenv from "dotenv";
import path from "node:path";
import { z } from "zod";

const environment = process.env.NODE_ENV || "local";

const envFile = `.env.${environment}`;

dotenv.config({
  path: path.resolve(process.cwd(), envFile),
});

const EnvSchema = z.object({
  NODE_ENV: z.enum(["local", "dev", "test", "uat", "prod"]),

  PORT: z.coerce.number().int().positive(),

  DB_HOST: z.string().min(1),

  DB_PORT: z.coerce.number().int().positive(),

  DB_NAME: z.string().min(1),

  DB_USER: z.string().min(1),

  DB_PASSWORD: z.string(),
});

const parsedEnv = EnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment configuration:", parsedEnv.error.format());

  process.exit(1);
}

export const env = parsedEnv.data;
