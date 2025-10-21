import { Redis, type RedisOptions } from "ioredis";
import { env } from "./env.js";

let redisInstance: Redis;

const redisConfig: RedisOptions = {
	host: env.REDIS_HOST,
	port: env.REDIS_PORT,
	password: env.REDIS_PASSWORD,
	db: env.REDIS_DB,
	keyPrefix: env.REDIS_KEY_PREFIX,
	maxRetriesPerRequest: env.REDIS_MAX_RETRIES,
	retryStrategy: (times: number) => {
		if (times > env.REDIS_MAX_RETRIES) {
			console.error("Redis max retries exceeded");
			return null;
		}
		const delay = Math.min(
			times * env.REDIS_RETRY_DELAY,
			env.REDIS_MAX_RETRY_DELAY,
		);
		return delay;
	},
	connectTimeout: env.REDIS_CONNECT_TIMEOUT,
	commandTimeout: env.REDIS_COMMAND_TIMEOUT,
	keepAlive: env.REDIS_KEEP_ALIVE,
	enableOfflineQueue: env.REDIS_ENABLE_OFFLINE_QUEUE,
	lazyConnect: env.REDIS_LAZY_CONNECT,
	enableReadyCheck: env.REDIS_ENABLE_READY_CHECK,
	showFriendlyErrorStack: env.NODE_ENV === "development",
};

export const getRedis = (): Redis => {
	if (!redisInstance) {
		redisInstance = new Redis(redisConfig);

		redisInstance.on("connect", () => {
			if (env.REDIS_ENABLE_LOGGING) {
				console.log("Redis connecting...");
			}
		});

		redisInstance.on("ready", () => {
			if (env.REDIS_ENABLE_LOGGING) {
				console.log("Redis connection ready");
			}
		});

		redisInstance.on("error", (err) => {
			console.error("Redis connection error:", err);
		});

		redisInstance.on("close", () => {
			if (env.REDIS_ENABLE_LOGGING) {
				console.log("Redis connection closed");
			}
		});

		redisInstance.on("reconnecting", (delay: number) => {
			if (env.REDIS_ENABLE_LOGGING) {
				console.log(`Redis reconnecting in ${delay}ms`);
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
		console.log("Redis connection closed successfully");
	}
};
