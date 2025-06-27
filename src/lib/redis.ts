import { Redis } from "ioredis";

let redisInstance: Redis;

export const getRedis = (): Redis => {
	if (!redisInstance) {
		redisInstance = new Redis({
			host: process.env.REDIS_HOST || "localhost",
			port: Number.parseInt(process.env.REDIS_PORT || "6379"),
			password: process.env.REDIS_PASSWORD || undefined,
			db: Number.parseInt(process.env.REDIS_DB || "0"),
		});
	}

	return redisInstance;
};

export const redisSet = async (key: string, value: string): Promise<"OK"> => {
	const redis = getRedis();
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
