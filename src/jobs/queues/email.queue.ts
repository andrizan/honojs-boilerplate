import type { Queue } from "bullmq";
import { createQueue } from "@/libs/queue";
import { QUEUE_NAMES } from "@/utils/constants";
import { pinoLogger } from "@/libs/logger";

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
    pinoLogger.info("Email queue initialized");
  }

  return emailQueue;
};

export const addEmailJob = async (data: EmailJobData) => {
  const queue = getEmailQueue();
  const job = await queue.add("send-email", data, {
    priority: 1,
  });
  pinoLogger.info({ jobId: job.id, to: data.to }, "Email job added to queue");
  return job;
};

export const addVerificationEmailJob = async (
  data: VerificationEmailJobData,
) => {
  const queue = getEmailQueue();
  const job = await queue.add("send-verification-email", data, {
    priority: 2, // Higher priority for verification emails
  });
  pinoLogger.info(
    { jobId: job.id, to: data.to },
    "Verification email job added to queue",
  );
  return job;
};

export const addPasswordResetEmailJob = async (
  data: PasswordResetEmailJobData,
) => {
  const queue = getEmailQueue();
  const job = await queue.add("send-password-reset-email", data, {
    priority: 2, // Higher priority for password reset
  });
  pinoLogger.info(
    { jobId: job.id, to: data.to },
    "Password reset email job added to queue",
  );
  return job;
};
