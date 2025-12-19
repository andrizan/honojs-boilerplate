import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "@/db/schema";
import { envSchema } from "@/config/env";
import { pinoLogger } from "@/libs/logger";

const poolConfig: PoolConfig = {
  connectionString: envSchema.DATABASE_URL,
  min: envSchema.DATABASE_POOL_MIN,
  max: envSchema.DATABASE_POOL_MAX,
  idleTimeoutMillis: envSchema.DATABASE_IDLE_TIMEOUT,
  connectionTimeoutMillis: envSchema.DATABASE_CONNECTION_TIMEOUT,
  statement_timeout: envSchema.DATABASE_STATEMENT_TIMEOUT,
  allowExitOnIdle: envSchema.DATABASE_ALLOW_EXIT_ON_IDLE,
};

const pool = new Pool(poolConfig);

pool.on("error", (err) => {
  const msg = err instanceof Error ? err.message : String(err);
  pinoLogger.error(`Unexpected database pool error: ${msg}`);
});

pool.on("connect", () => {
  if (envSchema.DATABASE_ENABLE_LOGGING) {
    pinoLogger.info("New database connection established");
  }
});

pool.on("remove", () => {
  if (envSchema.DATABASE_ENABLE_LOGGING) {
    pinoLogger.info("Database connection removed from pool");
  }
});

export const db = drizzle(pool, { schema });

export const checkDbConnection = async () => {
  try {
    await pool.query("SELECT 1");
    return { status: "connected", error: null };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
};

export const getDbPoolStats = () => {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  };
};

export const closeDbPool = async () => {
  try {
    await pool.end();
    pinoLogger.info("Database pool closed successfully");
  } catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
    pinoLogger.error(`Error closing database pool: ${msg}`);
    throw err;
  }
};
