import type { Context, Next } from "hono";
import { getRedis, redisIncr } from "../lib/redis.js";

interface RateLimitOptions {
  windowSec: number;      // Durasi window dalam detik
  max: number;            // Maksimum request per window
}

/**
 * Middleware to enforce rate limiting per IP address using Redis.
 *
 * @param options - Configuration options for rate limiting.
 * @param options.windowSec - The time window in seconds for rate limiting.
 * @param options.max - The maximum number of allowed requests within the time window.
 * @returns An async middleware function for Hono that limits requests per IP.
 *
 * The middleware increments a counter in Redis for each request from an IP address.
 * If the request count exceeds the specified maximum within the time window,
 * it responds with HTTP 429 (Too Many Requests).
 */
export const rateLimit = (options: RateLimitOptions) => {
  const { windowSec, max } = options;

  return async (c: Context, next: Next) => {
    const ip = c.req.header("x-forwarded-for") || "unknown";
    const key = `rate_limit:${ip}`;
    const redis = getRedis();

    const currentCount = await redisIncr(key);

    if (currentCount === 1) {
      await redis.expire(key, windowSec);
    }

    if (currentCount > max) {
      return c.text("Too many requests, please try again later.", 429);
    }

    await next();
  };
};
