import { Queue, type QueueOptions } from "bullmq";
import { logger } from "../shared/logger.js";
import { getRedis } from "./redis.js";

const queues = new Map<string, Queue>();

export const createQueue = <T = unknown>(
	name: string,
	options?: Partial<QueueOptions>,
): Queue<T> => {
	if (queues.has(name)) {
		return queues.get(name) as Queue<T>;
	}

	const queue = new Queue<T>(name, {
		connection: getRedis(),
		...options,
	});

	queues.set(name, queue);

	logger.info({ queueName: name }, "Queue created");

	return queue;
};

export const getQueue = <T = unknown>(name: string): Queue<T> | undefined => {
	return queues.get(name) as Queue<T> | undefined;
};

export const closeAllQueues = async (): Promise<void> => {
	const closePromises = Array.from(queues.values()).map((queue) =>
		queue.close(),
	);
	await Promise.all(closePromises);
	queues.clear();
	logger.info("All queues closed");
};
