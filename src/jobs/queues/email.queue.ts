import type { Queue } from "bullmq";
import { createQueue } from "../../infrastructure/queue.js";
import { QUEUE_NAMES } from "../../shared/constants.js";
import { logger } from "../../shared/logger.js";

export interface EmailJobData {
	to: string;
	subject: string;
	text?: string;
	html?: string;
}

export interface VerificationEmailJobData {
	to: string;
	verificationUrl: string;
}

export interface PasswordResetEmailJobData {
	to: string;
	resetUrl: string;
}

let emailQueue: Queue<
	EmailJobData | VerificationEmailJobData | PasswordResetEmailJobData
>;

export const getEmailQueue = () => {
	if (!emailQueue) {
		emailQueue = createQueue(QUEUE_NAMES.EMAIL, {
			defaultJobOptions: {
				attempts: 3,
				backoff: {
					type: "exponential",
					delay: 2000,
				},
				removeOnComplete: { count: 100 },
				removeOnFail: { count: 500 },
			},
		});
		logger.info("Email queue initialized");
	}

	return emailQueue;
};

export const addEmailJob = async (data: EmailJobData) => {
	const queue = getEmailQueue();
	const job = await queue.add("send-email", data, {
		priority: 1,
	});
	logger.info({ jobId: job.id, to: data.to }, "Email job added to queue");
	return job;
};

export const addVerificationEmailJob = async (
	data: VerificationEmailJobData,
) => {
	const queue = getEmailQueue();
	const job = await queue.add("send-verification-email", data, {
		priority: 2, // Higher priority for verification emails
	});
	logger.info({ jobId: job.id, to: data.to }, "Verification email job added to queue");
	return job;
};

export const addPasswordResetEmailJob = async (
	data: PasswordResetEmailJobData,
) => {
	const queue = getEmailQueue();
	const job = await queue.add("send-password-reset-email", data, {
		priority: 2, // Higher priority for password reset
	});
	logger.info({ jobId: job.id, to: data.to }, "Password reset email job added to queue");
	return job;
};
