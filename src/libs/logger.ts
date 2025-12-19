import { envSchema } from "@/config/env";
import type { Context, Next } from "hono";
import pino, { type LoggerOptions } from "pino";

const isProd = envSchema.NODE_ENV === "production";

const baseOptions: LoggerOptions = {
  level: isProd ? "info" : "debug",
  timestamp: pino.stdTimeFunctions.isoTime,
};

const transport = isProd
  ? undefined
  : {
      // Pretty transport only for local/dev to keep prod output structured
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname",
        translateTime: "SYS:standard",
      },
    };

export const pinoLogger = pino({
  ...baseOptions,
  transport,
});

export const requestLogger = async (c: Context, next: Next) => {
  const start = performance.now();
  const method = c.req.method;
  const path = c.req.path;

  try {
    await next();
  } catch (err) {
    const duration = performance.now() - start;
    pinoLogger.error(
      { err, method, path, status: 500, durationMs: duration.toFixed(2) },
      "Unhandled error during request",
    );
    throw err;
  }

  const duration = performance.now() - start;
  pinoLogger.info(
    { method, path, status: c.res.status, durationMs: duration.toFixed(2) },
    "HTTP request",
  );
};
