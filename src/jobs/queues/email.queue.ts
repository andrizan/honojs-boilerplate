import type { Queue } from "bullmq";
import { createQueue } from "../../infrastructure/queue.js";
import { QUEUE_NAMES } from "../../shared/constants.js";

export interface EmailJobData {
	to: string | string[];
	subject: string;
	text?: string;
	html?: string;
}

export interface WelcomeEmailJobData {
	to: string;
	name: string;
}

export interface PasswordResetEmailJobData {
	to: string;
	resetToken: string;
}

let emailQueue: Queue<
	EmailJobData | WelcomeEmailJobData | PasswordResetEmailJobData
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
				removeOnComplete: true,
				removeOnFail: false,
			},
		});
	}

	return emailQueue;
};

export const addEmailJob = async (data: EmailJobData) => {
	const queue = getEmailQueue();
	return await queue.add("send-email", data);
};

export const addWelcomeEmailJob = async (data: WelcomeEmailJobData) => {
	const queue = getEmailQueue();
	return await queue.add("send-welcome-email", data);
};

export const addPasswordResetEmailJob = async (
	data: PasswordResetEmailJobData,
) => {
	const queue = getEmailQueue();
	return await queue.add("send-password-reset-email", data);
};
