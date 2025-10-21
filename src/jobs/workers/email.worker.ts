import { Worker, type Job } from "bullmq";
import { getRedis } from "../../infrastructure/redis.js";
import { logger } from "../../shared/logger.js";
import { QUEUE_NAMES } from "../../shared/constants.js";
import {
	sendEmailDirect,
	generateVerificationEmailHtml,
	generatePasswordResetEmailHtml,
} from "../../libs/email.js";
import type {
	EmailJobData,
	VerificationEmailJobData,
	PasswordResetEmailJobData,
} from "../queues/email.queue.js";

const emailWorker = new Worker(
	QUEUE_NAMES.EMAIL,
	async (job: Job) => {
		const { name, data } = job;

		try {
			switch (name) {
				case "send-email": {
					const emailData = data as EmailJobData;
					await sendEmailDirect(emailData);
					break;
				}

				case "send-verification-email": {
					const verificationData = data as VerificationEmailJobData;
					const html = generateVerificationEmailHtml(verificationData.verificationUrl);
					const text = `
Verify Your Email Address

Thank you for signing up! Please verify your email address to complete your registration.

Click the link below to verify your email:
${verificationData.verificationUrl}

If you didn't create an account, you can safely ignore this email.
					`;

					await sendEmailDirect({
						to: verificationData.to,
						subject: "Verify Your Email Address",
						html,
						text,
					});
					break;
				}

				case "send-password-reset-email": {
					const resetData = data as PasswordResetEmailJobData;
					const html = generatePasswordResetEmailHtml(resetData.resetUrl);
					const text = `
Reset Your Password

We received a request to reset your password. Click the link below to create a new password:
${resetData.resetUrl}

Security Tips:
- This link will expire in 1 hour
- If you didn't request this, please ignore this email
- Never share your password with anyone
					`;

					await sendEmailDirect({
						to: resetData.to,
						subject: "Reset Your Password",
						html,
						text,
					});
					break;
				}

				default:
					throw new Error(`Unknown job type: ${name}`);
			}

			logger.info({ jobId: job.id, jobName: name }, "Email job processed successfully");
		} catch (error) {
			logger.error(
				{ error, jobId: job.id, jobName: name },
				"Failed to process email job"
			);
			throw error;
		}
	},
	{
		connection: getRedis(),
		concurrency: 5,
		removeOnComplete: { count: 100 },
		removeOnFail: { count: 500 },
	}
);

emailWorker.on("completed", (job) => {
	logger.info({ jobId: job.id }, "Email job completed");
});

emailWorker.on("failed", (job, err) => {
	logger.error({ jobId: job?.id, error: err }, "Email job failed");
});

emailWorker.on("error", (err) => {
	logger.error({ error: err }, "Email worker error");
});

export default emailWorker;
