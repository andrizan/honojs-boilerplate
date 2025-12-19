import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { startWorkers } from "@/jobs/workers/index";
import { auth } from "@/libs/auth";
import { pinoLogger } from "@/libs/logger";
import { checkBullMqConnection } from "@/libs/queue";
import { validateContentType } from "@/middlewares/content-type.middleware";
import { rateLimit } from "@/middlewares/rate-limit.middleware";
import routes from "@/routes/routes";
import { sendError, sendSuccess } from "@/helpers/response";
import { checkRedisConnection } from "@/libs/redis";
import { checkDbConnection } from "@/libs/postgres";
import { checkS3Connection } from "@/libs/s3";
import { verifySmtpConnection } from "@/libs/email";
import { envSchema } from "@/config/env";

const app = new Hono();

app.use("*", cors());
app.use("*", rateLimit({ windowMs: 60 * 1000, limit: 100 }));

app.onError((err, c) => {
  pinoLogger.error({ err }, "Unhandled application error");
  return sendError(c, "Internal Server Error", 500, err.message);
});

app.get("/", (c) => {
  return sendSuccess(c, "API is running");
});

app.get("/readyz", (c) => {
  return c.text("ok");
});

app.get("/health", async (c) => {
  const [redis, postgres, s3, bullmq] = await Promise.all([
    checkRedisConnection(),
    checkDbConnection(),
    checkS3Connection(),
    checkBullMqConnection(),
  ]);

  const checks = { redis, postgres, s3, bullmq } as const;
  const entries = Object.entries(checks);

  entries.forEach(([service, result]) => {
    const log = { service, status: result.status };
    const msg = result.error
      ? `Health ${service} failed: ${result.error}`
      : `Health ${service} ok`;
    if (result.status === "connected") {
      pinoLogger.info(log, msg);
    } else {
      pinoLogger.error({ ...log, error: result.error }, msg);
    }
  });

  const allHealthy = entries.every(([, result]) => result.status === "connected");

  return sendSuccess(
    c,
    {
      status: allHealthy ? "ok" : "degraded",
      checks,
    },
    allHealthy ? 200 : 503,
  );
});

app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

app.use("/api/*", validateContentType);
app.route("/api/v1", routes);

const rawHost = envSchema.APP_HOST || "";
const host = new URL(rawHost);

const logHealth = async (
  name: string,
  checker: () => Promise<{ status: string; error: string | null }>,
) => {
  const result = await checker();
  const base = { service: name, status: result.status };
  const msg = result.error
    ? `${name.toUpperCase()} FAILED: ${result.error}`
    : `${name.toUpperCase()} OK`;
  if (result.status === "connected") {
    pinoLogger.info(base, msg);
  } else {
    pinoLogger.error({ ...base, error: result.error }, msg);
  }
  return result;
};

const run = async () => {
  pinoLogger.info("Running startup health checks");

  await Promise.all([
    logHealth("redis", checkRedisConnection),
    logHealth("postgres", checkDbConnection),
    logHealth("s3", checkS3Connection),
    logHealth("bullmq", checkBullMqConnection),
    logHealth("smtp", verifySmtpConnection),
  ]);

  serve(
    {
      fetch: app.fetch,
      port: envSchema.APP_PORT,
      hostname: host.hostname,
    },
    (info) => {
      pinoLogger.info(`Server is running on ${rawHost}:${info.port}`);
      startWorkers();
    },
  );
};

run().catch((err) => {
  pinoLogger.error({ err }, "Startup failed");
  process.exit(1);
});
