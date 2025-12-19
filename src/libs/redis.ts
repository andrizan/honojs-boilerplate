import { envSchema } from "@/config/env";
import { pinoLogger } from "@/libs/logger";
import { CACHE_TTL } from "@/utils/constants";
import { Redis, type RedisOptions } from "ioredis";

let redisInstance: Redis;

export interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

const redisConfig: RedisOptions = {
  host: envSchema.REDIS_HOST,
  port: envSchema.REDIS_PORT,
  password: envSchema.REDIS_PASSWORD,
  db: envSchema.REDIS_DB,
  keyPrefix: envSchema.REDIS_KEY_PREFIX,
  // BullMQ requires `maxRetriesPerRequest` to be null for blocking connections
  maxRetriesPerRequest: null,
  retryStrategy: (times: number) => {
    if (times > envSchema.REDIS_MAX_RETRIES) {
      console.error("Redis max retries exceeded");
      return null;
    }
    const delay = Math.min(
      times * envSchema.REDIS_RETRY_DELAY,
      envSchema.REDIS_MAX_RETRY_DELAY,
    );
    return delay;
  },
  connectTimeout: envSchema.REDIS_CONNECT_TIMEOUT,
  commandTimeout: envSchema.REDIS_COMMAND_TIMEOUT,
  keepAlive: envSchema.REDIS_KEEP_ALIVE,
  enableOfflineQueue: envSchema.REDIS_ENABLE_OFFLINE_QUEUE,
  lazyConnect: envSchema.REDIS_LAZY_CONNECT,
  enableReadyCheck: envSchema.REDIS_ENABLE_READY_CHECK,
  showFriendlyErrorStack: envSchema.NODE_ENV === "development",
};

export const getRedis = (): Redis => {
  if (!redisInstance) {
    redisInstance = new Redis(redisConfig);

    redisInstance.on("connect", () => {
      if (envSchema.REDIS_ENABLE_LOGGING) {
        pinoLogger.info("Redis connecting...");
      }
    });

    redisInstance.on("ready", () => {
      if (envSchema.REDIS_ENABLE_LOGGING) {
        pinoLogger.info("Redis connection ready");
      }
    });

    redisInstance.on("error", (err) => {
      pinoLogger.error({ err }, "Redis connection error");
    });

    redisInstance.on("close", () => {
      if (envSchema.REDIS_ENABLE_LOGGING) {
        pinoLogger.warn("Redis connection closed");
      }
    });

    redisInstance.on("reconnecting", (delay: number) => {
      if (envSchema.REDIS_ENABLE_LOGGING) {
        pinoLogger.warn({ delay }, "Redis reconnecting");
      }
    });
  }

  return redisInstance;
};

export const redisSet = async (
  key: string,
  value: string,
  ttlInSeconds?: number,
): Promise<"OK"> => {
  const redis = getRedis();
  if (ttlInSeconds) {
    return redis.set(key, value, "EX", ttlInSeconds);
  }
  return redis.set(key, value);
};

export const redisGet = async (key: string): Promise<string | null> => {
  const redis = getRedis();
  return redis.get(key);
};

export const redisDel = async (key: string): Promise<number> => {
  const redis = getRedis();
  return redis.del(key);
};

export const redisIncr = async (key: string): Promise<number> => {
  const redis = getRedis();
  return redis.incr(key);
};

export const checkRedisConnection = async (): Promise<{
  status: string;
  error: string | null;
}> => {
  try {
    const redis = getRedis();
    await redis.ping();
    return { status: "connected", error: null };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
};

export const closeRedisConnection = async (): Promise<void> => {
  if (redisInstance) {
    await redisInstance.quit();
    pinoLogger.info("Redis connection closed successfully");
  }
};

const buildKey = (key: string, prefix?: string): string => {
  return prefix ? `${prefix}:${key}` : key;
};

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

    pinoLogger.debug({ key: finalKey, ttl }, "Value cached");

    return true;
  } catch (err) {
    pinoLogger.error({ error: err, key }, "Failed to cache value");
    return false;
  }
};

export const cacheGet = async <T>(
  key: string,
  options: Pick<CacheOptions, "prefix"> = {},
): Promise<T | null> => {
  try {
    const { prefix } = options;
    const finalKey = buildKey(key, prefix);
    const cached = await redisGet(finalKey);

    if (!cached) {
      pinoLogger.debug({ key: finalKey }, "Cache miss");
      return null;
    }

    pinoLogger.debug({ key: finalKey }, "Cache hit");

    return JSON.parse(cached) as T;
  } catch (err) {
    pinoLogger.error({ error: err, key }, "Failed to get cached value");
    return null;
  }
};

export const cacheDelete = async (
  key: string,
  options: Pick<CacheOptions, "prefix"> = {},
): Promise<boolean> => {
  try {
    const { prefix } = options;
    const finalKey = buildKey(key, prefix);
    const deleted = await redisDel(finalKey);

    pinoLogger.debug({ key: finalKey }, "Cache deleted");

    return deleted > 0;
  } catch (err) {
    pinoLogger.error({ error: err, key }, "Failed to delete cached value");
    return false;
  }
};

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

    pinoLogger.info(
      { pattern: finalPattern, count: deleted },
      "Cache pattern invalidated",
    );

    return deleted;
  } catch (err) {
    pinoLogger.error(
      { error: err, pattern },
      "Failed to invalidate cache pattern",
    );
    return 0;
  }
};

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
    pinoLogger.error({ error: err, key }, "Failed to check cache existence");
    return false;
  }
};

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
    pinoLogger.error({ error: err, key }, "Failed to get cache TTL");
    return -1;
  }
};
