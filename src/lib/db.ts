import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
	connectionString: process.env.DATABASE_URL ?? "",
	max: Number.parseInt(process.env.DATABASE_POOL_MAX ?? "10", 10),
	idleTimeoutMillis: Number.parseInt(
		process.env.DATABASE_IDLE_TIMEOUT ?? "30000",
		10,
	),
});

export const db = drizzle(pool);

export const checkDbConnection = async (): Promise<{
	status: string;
	error: string;
}> => {
	try {
		await db.execute(sql`SELECT 1`);
		return {
			status: "connected",
			error: "",
		};
	} catch (err) {
		return {
			status: "error",
			error: err instanceof Error ? err.message : "Unknown error",
		};
	}
};
