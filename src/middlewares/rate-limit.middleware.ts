import { getRedis } from "@/libs/redis";
import type { RedisClient } from "@hono-rate-limiter/redis";
import { RedisStore } from "@hono-rate-limiter/redis";
import { rateLimiter } from "hono-rate-limiter";

interface RateLimitOptions {
  windowMs: number;
  limit: number;
}

/**
 * Creates a rate limiter middleware using Redis store.
 *
 * @param options - Configuration options for rate limiting.
 * @param options.windowMs - The time window in milliseconds for rate limiting.
 * @param options.limit - The maximum number of allowed requests within the time window.
 * @returns A middleware function that enforces the rate limit and responds with a 429 status code if exceeded.
 *
 * @example
 * app.use("*",rateLimit({ windowMs: 60000, limit: 100 }));
 */
export const rateLimit = (options: RateLimitOptions) => {
  const { windowMs, limit } = options;

  const redis = getRedis();

  const redisClient: RedisClient = {
    scriptLoad: (script: string) =>
      redis.script("LOAD", script) as Promise<string>,
    evalsha: <TArgs extends unknown[], TData = unknown>(
      sha1: string,
      keys: string[],
      args: TArgs,
    ) =>
      redis.evalsha(
        sha1,
        keys.length,
        ...keys,
        ...(args as string[]),
      ) as Promise<TData>,
    decr: (key: string) => redis.decr(key),
    del: (key: string) => redis.del(key),
  };

  return rateLimiter({
    windowMs,
    limit,
    standardHeaders: "draft-6",
    keyGenerator: (c) => c.req.header("x-forwarded-for") || "unknown",
    store: new RedisStore({ client: redisClient }),
  });
};
