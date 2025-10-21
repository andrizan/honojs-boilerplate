import { logger } from "../../shared/logger.js";
import emailWorker from "./email.worker.js";

export function startWorkers() {
	logger.info("Starting all workers...");
	
	// Email worker is automatically started when imported
	logger.info("Email worker started");
}

export async function stopWorkers() {
	logger.info("Stopping all workers...");
	
	await emailWorker.close();
	
	logger.info("All workers stopped");
}

export { emailWorker };
