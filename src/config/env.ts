import "dotenv/config";
import { z } from "zod";

const emptyToUndefined = (value: string | undefined) =>
  value && value.trim() !== "" ? value : undefined;

const envDefinition = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_PORT: z.coerce.number().int().positive().default(9000),
  APP_HOST: z.string().default("http://localhost"),

  DATABASE_URL: z.string().default(""),
  DATABASE_POOL_MIN: z.coerce.number().int().nonnegative().default(2),
  DATABASE_POOL_MAX: z.coerce.number().int().nonnegative().default(10),
  DATABASE_IDLE_TIMEOUT: z.coerce.number().int().nonnegative().default(30000),
  DATABASE_CONNECTION_TIMEOUT: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(5000),
  DATABASE_STATEMENT_TIMEOUT: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(30000),
  DATABASE_ALLOW_EXIT_ON_IDLE: z.coerce.boolean().default(false),
  DATABASE_ENABLE_LOGGING: z.coerce.boolean().default(false),

  BETTER_AUTH_SECRET: z.string().default(""),

  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional().transform(emptyToUndefined),
  REDIS_DB: z.coerce.number().int().nonnegative().default(0),
  REDIS_KEY_PREFIX: z.string().default(""),
  REDIS_MAX_RETRIES: z.coerce.number().int().nonnegative().default(3),
  REDIS_RETRY_DELAY: z.coerce.number().int().nonnegative().default(1000),
  REDIS_MAX_RETRY_DELAY: z.coerce.number().int().nonnegative().default(5000),
  REDIS_CONNECT_TIMEOUT: z.coerce.number().int().nonnegative().default(10000),
  REDIS_COMMAND_TIMEOUT: z.coerce.number().int().nonnegative().default(5000),
  REDIS_KEEP_ALIVE: z.coerce.number().int().nonnegative().default(30000),
  REDIS_ENABLE_OFFLINE_QUEUE: z.coerce.boolean().default(true),
  REDIS_LAZY_CONNECT: z.coerce.boolean().default(false),
  REDIS_ENABLE_READY_CHECK: z.coerce.boolean().default(true),
  REDIS_ENABLE_LOGGING: z.coerce.boolean().default(false),

  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),

  FACEBOOK_CLIENT_ID: z.string().default(""),
  FACEBOOK_CLIENT_SECRET: z.string().default(""),

  DISCORD_CLIENT_ID: z.string().default(""),
  DISCORD_CLIENT_SECRET: z.string().default(""),

  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  SMTP_FROM: z.string().default("noreply@example.com"),

  AWS_REGION: z.string().default("us-east-1"),
  AWS_ACCESS_KEY_ID: z.string().default(""),
  AWS_SECRET_ACCESS_KEY: z.string().default(""),
  AWS_S3_BUCKET: z.string().default(""),
  AWS_S3_ENDPOINT: z.string().optional().transform(emptyToUndefined),
  AWS_S3_FORCE_PATH_STYLE: z.coerce.boolean().default(false),
});

const parsed = envDefinition.parse(process.env);

// Export parsed values under both names used in the codebase
export const envSchema = parsed;
