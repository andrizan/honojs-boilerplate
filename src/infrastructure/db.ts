import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import { env } from "./env.js";
import * as schema from "./schema.js";

const poolConfig: PoolConfig = {
	connectionString: env.DATABASE_URL,
	min: env.DATABASE_POOL_MIN,
	max: env.DATABASE_POOL_MAX,
	idleTimeoutMillis: env.DATABASE_IDLE_TIMEOUT,
	connectionTimeoutMillis: env.DATABASE_CONNECTION_TIMEOUT,
	statement_timeout: env.DATABASE_STATEMENT_TIMEOUT,
	allowExitOnIdle: env.DATABASE_ALLOW_EXIT_ON_IDLE,
};

const pool = new Pool(poolConfig);

pool.on("error", (err) => {
	console.error("Unexpected database pool error:", err);
});

pool.on("connect", () => {
	if (env.DATABASE_ENABLE_LOGGING) {
		console.log("New database connection established");
	}
});

pool.on("remove", () => {
	if (env.DATABASE_ENABLE_LOGGING) {
		console.log("Database connection removed from pool");
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
		console.log("Database pool closed successfully");
	} catch (err) {
		console.error("Error closing database pool:", err);
		throw err;
	}
};
