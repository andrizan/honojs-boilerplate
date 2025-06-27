import type { Context, Next } from "hono";
import { getRedis, redisIncr } from "../lib/redis.js";

interface RateLimitOptions {
  windowSec: number;      // Durasi window dalam detik
  max: number;            // Maksimum request per window
}

/**
 * Middleware to apply rate limiting to incoming requests based on IP address.
 *
 * @param options - Configuration options for rate limiting.
 * @param options.windowSec - The time window in seconds for rate limiting.
 * @param options.max - The maximum number of allowed requests within the time window.
 * @returns A middleware function that enforces the rate limit and responds with a 429 status code if exceeded.
 *
 * @example
 * app.use("*",rateLimit({ windowSec: 60, max: 100 }));
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
			return c.json(
				{ error: "Too many requests, please try again later." },
				429,
			);
		}

		await next();
	};
};
