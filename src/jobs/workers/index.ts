import { pinoLogger } from "@/libs/logger";
import emailWorker from "@/jobs/workers/email.worker";

export function startWorkers() {
  pinoLogger.info("Starting all workers...");

  // Email worker is automatically started when imported
  emailWorker
    .waitUntilReady()
    .then(() => {
      pinoLogger.info("Email worker started");
    })
    .catch((err) => {
      pinoLogger.error({ err }, "Email worker failed to start");
    });
}

export async function stopWorkers() {
  pinoLogger.info("Stopping all workers...");

  await emailWorker.close();

  pinoLogger.info("All workers stopped");
}

export { emailWorker };
