import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import {
	checkDbConnection,
	checkRedisConnection,
	checkS3Connection,
	closeAllQueues,
	closeDbPool,
	closeRedisConnection,
	closeS3Client,
	env,
	getDbPoolStats,
	verifySmtpConnection,
} from "./infrastructure/index.js";
import { auth } from "./libs/auth.js";
import { userRouter, blogRouter } from "./modules/index.js";
import { logger as pinoLogger } from "./shared/logger.js";
import { validateContentType } from "./shared/middlewares/content-type.middleware.js";
import { errorHandler } from "./shared/middlewares/error.middleware.js";
import { rateLimit } from "./shared/middlewares/rate-limit.middleware.js";

const app = new Hono();

app.use("*", errorHandler);
app.use("*", cors());
app.use("*", logger());
app.use("*", rateLimit({ windowMs: 60 * 1000, limit: 100 }));

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.get("/api/health", async (c) => {
	const [redisStatus, dbStatus, s3Status, smtpStatus] = await Promise.all([
		checkRedisConnection(),
		checkDbConnection(),
		checkS3Connection(),
		verifySmtpConnection(),
	]);
	const dbPoolStats = getDbPoolStats();

	const hasError = !!(
		redisStatus.error ||
		dbStatus.error ||
		s3Status.error ||
		smtpStatus.error
	);

	return c.json({
		status: hasError ? "error" : "ok",
		redis: {
			status: redisStatus.status,
			error: redisStatus.error,
		},
		database: {
			status: dbStatus.status,
			error: dbStatus.error,
			pool: dbPoolStats,
		},
		s3: {
			status: s3Status.status,
			error: s3Status.error,
		},
		smtp: {
			status: smtpStatus.status,
			error: smtpStatus.error,
		},
		timestamp: new Date().toISOString(),
		environment: env.NODE_ENV,
	});
});

app.on(["POST", "GET"], "/api/auth/**", (c) => {
	return auth.handler(c.req.raw);
});

app.use("/api/*", validateContentType);
app.route("/api/users", userRouter);
app.route("/api/blogs", blogRouter);

serve(
	{
		fetch: app.fetch,
		port: Number.parseInt(env.APP_PORT),
	},
	(info) => {
		pinoLogger.info(`Server is running on ${env.APP_URL}:${info.port}`);
	},
);

const shutdown = async () => {
	pinoLogger.info("Shutting down gracefully...");
	try {
		await closeAllQueues();
		closeS3Client();
		await closeRedisConnection();
		await closeDbPool();
		pinoLogger.info("Shutdown complete");
		process.exit(0);
	} catch (err) {
		pinoLogger.error({ error: err }, "Error during shutdown");
		process.exit(1);
	}
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
