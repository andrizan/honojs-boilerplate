import "dotenv/config";

export const env = {
	NODE_ENV: process.env.NODE_ENV || "development",
	APP_PORT: process.env.APP_PORT || "3000",
	APP_URL: process.env.APP_URL || "http://localhost",

	DATABASE_URL: process.env.DATABASE_URL || "",
	DATABASE_POOL_MIN: Number.parseInt(process.env.DATABASE_POOL_MIN || "2"),
	DATABASE_POOL_MAX: Number.parseInt(process.env.DATABASE_POOL_MAX || "10"),
	DATABASE_IDLE_TIMEOUT: Number.parseInt(
		process.env.DATABASE_IDLE_TIMEOUT || "30000",
	),
	DATABASE_CONNECTION_TIMEOUT: Number.parseInt(
		process.env.DATABASE_CONNECTION_TIMEOUT || "5000",
	),
	DATABASE_STATEMENT_TIMEOUT: Number.parseInt(
		process.env.DATABASE_STATEMENT_TIMEOUT || "30000",
	),
	DATABASE_ALLOW_EXIT_ON_IDLE:
		process.env.DATABASE_ALLOW_EXIT_ON_IDLE === "true",
	DATABASE_ENABLE_LOGGING: process.env.DATABASE_ENABLE_LOGGING === "true",

	BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "",

	REDIS_HOST: process.env.REDIS_HOST || "localhost",
	REDIS_PORT: Number.parseInt(process.env.REDIS_PORT || "6379"),
	REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
	REDIS_DB: Number.parseInt(process.env.REDIS_DB || "0"),
	REDIS_KEY_PREFIX: process.env.REDIS_KEY_PREFIX || "",
	REDIS_MAX_RETRIES: Number.parseInt(process.env.REDIS_MAX_RETRIES || "3"),
	REDIS_RETRY_DELAY: Number.parseInt(process.env.REDIS_RETRY_DELAY || "1000"),
	REDIS_MAX_RETRY_DELAY: Number.parseInt(
		process.env.REDIS_MAX_RETRY_DELAY || "5000",
	),
	REDIS_CONNECT_TIMEOUT: Number.parseInt(
		process.env.REDIS_CONNECT_TIMEOUT || "10000",
	),
	REDIS_COMMAND_TIMEOUT: Number.parseInt(
		process.env.REDIS_COMMAND_TIMEOUT || "5000",
	),
	REDIS_KEEP_ALIVE: Number.parseInt(process.env.REDIS_KEEP_ALIVE || "30000"),
	REDIS_ENABLE_OFFLINE_QUEUE:
		process.env.REDIS_ENABLE_OFFLINE_QUEUE !== "false",
	REDIS_LAZY_CONNECT: process.env.REDIS_LAZY_CONNECT === "true",
	REDIS_ENABLE_READY_CHECK: process.env.REDIS_ENABLE_READY_CHECK !== "false",
	REDIS_ENABLE_LOGGING: process.env.REDIS_ENABLE_LOGGING === "true",

	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",

	FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID || "",
	FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET || "",

	DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || "",
	DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || "",

	SMTP_HOST: process.env.SMTP_HOST || "localhost",
	SMTP_PORT: Number.parseInt(process.env.SMTP_PORT || "587"),
	SMTP_SECURE: process.env.SMTP_SECURE === "true",
	SMTP_USER: process.env.SMTP_USER || "",
	SMTP_PASS: process.env.SMTP_PASS || "",
	SMTP_FROM: process.env.SMTP_FROM || "noreply@example.com",

	AWS_REGION: process.env.AWS_REGION || "us-east-1",
	AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
	AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
	AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || "",
	AWS_S3_ENDPOINT: process.env.AWS_S3_ENDPOINT || undefined,
	AWS_S3_FORCE_PATH_STYLE: process.env.AWS_S3_FORCE_PATH_STYLE === "true",
};
