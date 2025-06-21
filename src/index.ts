import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { checkDbConnection } from "./lib/db.js";
import { getRedis } from "./lib/redis.js";
import { auth, users } from "./routers/index.route.js";
import { parse } from "node:path";

const app = new Hono();
app.use("*", cors(), logger());

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.get("/api/health", async (c) => {
	let redisStatus = "disconnected";
	let redisError = "";
	let redisPing: string | null = null;

	try {
		const redis = getRedis();
		redisPing = await redis.ping();
		if (redisPing === "PONG") redisStatus = "connected";
	} catch (err) {
		redisStatus = "error";
		redisError = err instanceof Error ? err.message : "Unknown error";
	}

	const dbStatus = await checkDbConnection();

	return c.json({
		status: redisError || dbStatus.error ? "error" : "ok",
		redis: { status: redisStatus, ping: redisPing, error: redisError },
		database: { status: dbStatus.status, error: dbStatus.error },
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV || "development",
	});
});

app.route("/auth", auth);

app.route("/api/v1/users", users);

serve(
	{
		fetch: app.fetch,
		port: parseInt(process.env.APP_PORT || "3000"),
	},
	(info) => {
		console.log(`Server is running on ${process.env.APP_URL}:${info.port}`);
	},
);
