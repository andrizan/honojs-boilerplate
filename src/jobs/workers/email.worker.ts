import { Worker, type Job } from "bullmq";
import { envSchema } from "@/config/env";
import { QUEUE_NAMES } from "@/utils/constants";
import {
  sendEmailDirect,
  generateVerificationEmailHtml,
  generatePasswordResetEmailHtml,
} from "@/libs/email";
import type {
  EmailJobData,
  VerificationEmailJobData,
  PasswordResetEmailJobData,
} from "@/jobs/queues/email.queue";
import { pinoLogger } from "@/libs/logger";
import type { RedisOptions } from "ioredis";

const redisOptions: RedisOptions = {
  host: envSchema.REDIS_HOST,
  port: envSchema.REDIS_PORT,
  password: envSchema.REDIS_PASSWORD,
  db: envSchema.REDIS_DB,
  keyPrefix: envSchema.REDIS_KEY_PREFIX,
  maxRetriesPerRequest: null,
  connectTimeout: envSchema.REDIS_CONNECT_TIMEOUT,
  // allow blocking commands without timeout; undefined means no client-side timeout
  commandTimeout: undefined,
  enableReadyCheck: false,
  lazyConnect: false,
  keepAlive: envSchema.REDIS_KEEP_ALIVE,
};

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
          const html = generateVerificationEmailHtml(
            verificationData.verificationUrl,
          );
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

      pinoLogger.info(
        { jobId: job.id, jobName: name },
        "Email job processed successfully",
      );
    } catch (error) {
      const e = error as Error | undefined;
      pinoLogger.error(
        {
          jobId: job.id,
          jobName: name,
          error: {
            message: e?.message ?? String(error),
            stack: e?.stack,
          },
        },
        "Failed to process email job",
      );
      throw error;
    }
  },
  {
    // Let BullMQ create its own blocking connection using provided options
    connection: redisOptions,
    blockingConnection: true,
    concurrency: 5,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
);

emailWorker.on("completed", (job) => {
  pinoLogger.info({ jobId: job.id }, "Email job completed");
});

emailWorker.on("failed", (job, err) => {
  const e = err as Error | undefined;
  pinoLogger.error(
    {
      jobId: job?.id,
      error: {
        message: e?.message ?? String(err),
        stack: e?.stack,
      },
    },
    "Email job failed",
  );
});

emailWorker.on("error", (err) => {
  const e = err as Error | undefined;
  pinoLogger.error(
    {
      error: {
        message: e?.message ?? String(err),
        stack: e?.stack,
      },
    },
    "Email worker error",
  );
});

export default emailWorker;
