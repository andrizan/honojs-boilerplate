import {
	getRedis,
	redisDel,
	redisGet,
	redisSet,
} from "../infrastructure/redis.js";
import { CACHE_TTL } from "../shared/constants.js";
import { logger } from "../shared/logger.js";

export interface CacheOptions {
	ttl?: number;
	prefix?: string;
}

/**
 * Build cache key with optional prefix
 */
const buildKey = (key: string, prefix?: string): string => {
	return prefix ? `${prefix}:${key}` : key;
};

/**
 * Set value in cache with optional TTL
 */
export const cacheSet = async <T>(
	key: string,
	value: T,
	options: CacheOptions = {},
): Promise<boolean> => {
	try {
		const { ttl = CACHE_TTL.MEDIUM, prefix } = options;
		const finalKey = buildKey(key, prefix);
		const serialized = JSON.stringify(value);

		await redisSet(finalKey, serialized, ttl);

		logger.debug({ key: finalKey, ttl }, "Value cached");

		return true;
	} catch (err) {
		logger.error({ error: err, key }, "Failed to cache value");
		return false;
	}
};

/**
 * Get value from cache
 */
export const cacheGet = async <T>(
	key: string,
	options: Pick<CacheOptions, "prefix"> = {},
): Promise<T | null> => {
	try {
		const { prefix } = options;
		const finalKey = buildKey(key, prefix);
		const cached = await redisGet(finalKey);

		if (!cached) {
			logger.debug({ key: finalKey }, "Cache miss");
			return null;
		}

		logger.debug({ key: finalKey }, "Cache hit");

		return JSON.parse(cached) as T;
	} catch (err) {
		logger.error({ error: err, key }, "Failed to get cached value");
		return null;
	}
};

/**
 * Delete value from cache
 */
export const cacheDelete = async (
	key: string,
	options: Pick<CacheOptions, "prefix"> = {},
): Promise<boolean> => {
	try {
		const { prefix } = options;
		const finalKey = buildKey(key, prefix);
		const deleted = await redisDel(finalKey);

		logger.debug({ key: finalKey }, "Cache deleted");

		return deleted > 0;
	} catch (err) {
		logger.error({ error: err, key }, "Failed to delete cached value");
		return false;
	}
};

/**
 * Get or set cache (fetch pattern)
 * If value exists in cache, return it. Otherwise, execute fetcher, cache result, and return it.
 */
export const cacheGetOrSet = async <T>(
	key: string,
	fetcher: () => Promise<T>,
	options: CacheOptions = {},
): Promise<T> => {
	const { prefix } = options;

	const cached = await cacheGet<T>(key, { prefix });
	if (cached !== null) {
		return cached;
	}

	const value = await fetcher();

	await cacheSet(key, value, options);

	return value;
};

/**
 * Invalidate multiple cache keys by pattern
 */
export const cacheInvalidatePattern = async (
	pattern: string,
	options: Pick<CacheOptions, "prefix"> = {},
): Promise<number> => {
	try {
		const { prefix } = options;
		const finalPattern = buildKey(pattern, prefix);
		const redis = getRedis();

		const keys = await redis.keys(finalPattern);

		if (keys.length === 0) {
			return 0;
		}

		const deleted = await redis.del(...keys);

		logger.info(
			{ pattern: finalPattern, count: deleted },
			"Cache pattern invalidated",
		);

		return deleted;
	} catch (err) {
		logger.error({ error: err, pattern }, "Failed to invalidate cache pattern");
		return 0;
	}
};

/**
 * Cache wrapper for functions (memoization)
 */
export const cacheable = <TArgs extends unknown[], TResult>(
	fn: (...args: TArgs) => Promise<TResult>,
	keyGenerator: (...args: TArgs) => string,
	options: CacheOptions = {},
) => {
	return async (...args: TArgs): Promise<TResult> => {
		const key = keyGenerator(...args);
		return await cacheGetOrSet(key, () => fn(...args), options);
	};
};

/**
 * Check if key exists in cache
 */
export const cacheExists = async (
	key: string,
	options: Pick<CacheOptions, "prefix"> = {},
): Promise<boolean> => {
	try {
		const { prefix } = options;
		const finalKey = buildKey(key, prefix);
		const redis = getRedis();

		const exists = await redis.exists(finalKey);

		return exists === 1;
	} catch (err) {
		logger.error({ error: err, key }, "Failed to check cache existence");
		return false;
	}
};

/**
 * Get TTL for a cached key
 */
export const cacheTTL = async (
	key: string,
	options: Pick<CacheOptions, "prefix"> = {},
): Promise<number> => {
	try {
		const { prefix } = options;
		const finalKey = buildKey(key, prefix);
		const redis = getRedis();

		return await redis.ttl(finalKey);
	} catch (err) {
		logger.error({ error: err, key }, "Failed to get cache TTL");
		return -1;
	}
};
