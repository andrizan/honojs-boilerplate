import { Queue, type QueueOptions } from "bullmq";
import { getRedis } from "@/libs/redis";
import { pinoLogger } from "@/libs/logger";

const queues = new Map<string, Queue>();

let healthQueue: Queue | null = null;

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

  pinoLogger.info({ queueName: name }, "Queue created");

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
  pinoLogger.info("All queues closed");
};

export const checkBullMqConnection = async (): Promise<{
  status: string;
  error: string | null;
}> => {
  try {
    if (!healthQueue) {
      healthQueue = new Queue("health-check", { connection: getRedis() });
    }

    await healthQueue.waitUntilReady();
    const client = await healthQueue.client;
    await client.ping();

    return { status: "connected", error: null };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
};
