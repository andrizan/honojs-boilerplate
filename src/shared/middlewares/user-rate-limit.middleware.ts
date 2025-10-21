import type { RedisClient } from "@hono-rate-limiter/redis";
import { RedisStore } from "@hono-rate-limiter/redis";
import type { Context, Next } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { getRedis } from "../../infrastructure/index.js";
import { logger } from "../logger.js";

interface UserRateLimitOptions {
	windowMs: number;
	limit: number;
	message?: string;
}

/**
 * Creates a rate limiter middleware for authenticated users.
 * Rate limits are applied per user ID instead of IP address.
 * 
 * This is crucial for regions like Indonesia where IPv4 exhaustion
 * causes many users to share the same public IP (carrier-grade NAT).
 *
 * @param options - Configuration options for rate limiting.
 * @param options.windowMs - The time window in milliseconds for rate limiting.
 * @param options.limit - The maximum number of allowed requests within the time window per user.
 * @param options.message - Custom error message when rate limit is exceeded.
 * @returns A middleware function that enforces the rate limit per user.
 *
 * @example
 * // Apply to authenticated routes
 * userRouter.use("/profile", userRateLimit({ windowMs: 60000, limit: 30 }));
 * userRouter.get("/profile", getUserProfile);
 */
export const userRateLimit = (options: UserRateLimitOptions) => {
	const { windowMs, limit, message } = options;

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

	const limiter = rateLimiter({
		windowMs,
		limit,
		standardHeaders: "draft-6",
		keyGenerator: (c: Context) => {
			// Try to get user from context (set by auth middleware)
			const user = c.get("user");
			
			if (user?.id) {
				// Use user ID for authenticated requests
				return `user:${user.id}`;
			}
			
			// Fallback to IP for unauthenticated requests
			// (This shouldn't happen if this middleware is used after auth middleware)
			const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
			logger.warn({ ip }, "User rate limit applied to unauthenticated request");
			return `ip:${ip}`;
		},
		store: new RedisStore({ client: redisClient }),
		message: message || "Too many requests from this user, please try again later.",
	});

	return async (c: Context, next: Next) => {
		return limiter(c, next);
	};
};

/**
 * Stricter rate limit for sensitive operations (e.g., password reset, avatar upload).
 * Lower limits to prevent abuse.
 */
export const strictUserRateLimit = () =>
	userRateLimit({
		windowMs: 60 * 1000, // 1 minute
		limit: 5, // 5 requests per minute
		message: "Too many attempts, please try again later.",
	});

/**
 * Standard rate limit for normal authenticated operations.
 */
export const standardUserRateLimit = () =>
	userRateLimit({
		windowMs: 60 * 1000, // 1 minute
		limit: 30, // 30 requests per minute
	});

/**
 * Relaxed rate limit for read-heavy operations.
 */
export const relaxedUserRateLimit = () =>
	userRateLimit({
		windowMs: 60 * 1000, // 1 minute
		limit: 60, // 60 requests per minute
	});
