import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import {
  addEmailJob,
  addVerificationEmailJob,
  addPasswordResetEmailJob,
} from "@/jobs/queues/email.queue";
import { envSchema } from "@/config/env";
import { pinoLogger } from "@/libs/logger";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: envSchema.SMTP_HOST,
    port: envSchema.SMTP_PORT,
    secure: envSchema.SMTP_SECURE,
    auth:
      envSchema.SMTP_USER && envSchema.SMTP_PASS
        ? {
            user: envSchema.SMTP_USER,
            pass: envSchema.SMTP_PASS,
          }
        : undefined,
  });

  return transporter;
}

/**
 * Internal function to actually send email via SMTP
 * Called by email worker, not directly by application code
 */
export async function sendEmailDirect({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  const transport = getTransporter();

  const info = await transport.sendMail({
    from: envSchema.SMTP_FROM,
    to,
    subject,
    html,
    text,
  });

  pinoLogger.info(
    { messageId: info.messageId, to, subject },
    "Email sent successfully",
  );
  return { success: true, messageId: info.messageId };
}

/**
 * Generate verification email HTML template
 */
export function generateVerificationEmailHtml(verificationUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #4F46E5; padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Verify Your Email</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for signing up! Please verify your email address to complete your registration.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${verificationUrl}"
                       style="background-color: #4F46E5; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                      Verify Email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color: #4F46E5; font-size: 14px; word-break: break-all; margin: 10px 0 0 0;">
                ${verificationUrl}
              </p>
              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
              <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 0;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                This is an automated message, please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
	`;
}

/**
 * Generate password reset email HTML template
 */
export function generatePasswordResetEmailHtml(resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #DC2626; padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Password Reset</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We received a request to reset your password. Click the button below to create a new password.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetUrl}"
                       style="background-color: #DC2626; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color: #DC2626; font-size: 14px; word-break: break-all; margin: 10px 0 0 0;">
                ${resetUrl}
              </p>
              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
              <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 0 0 10px 0;">
                <strong>Security Tips:</strong>
              </p>
              <ul style="color: #999999; font-size: 12px; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Never share your password with anyone</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                This is an automated message, please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
	`;
}

/**
 * Queue an email to be sent asynchronously
 * Email will be sent by the email worker with retry logic
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  try {
    const job = await addEmailJob({ to, subject, html, text });
    pinoLogger.info(
      { jobId: job.id, to, subject },
      "Email queued successfully",
    );
    return { success: true, jobId: job.id };
  } catch (error) {
    pinoLogger.error({ error, to, subject }, "Failed to queue email");
    throw error;
  }
}

/**
 * Queue verification email with higher priority
 */
export async function sendVerificationEmail(
  email: string,
  verificationUrl: string,
) {
  try {
    const job = await addVerificationEmailJob({
      to: email,
      verificationUrl,
    });
    pinoLogger.info(
      { jobId: job.id, to: email },
      "Verification email queued successfully",
    );
    return { success: true, jobId: job.id };
  } catch (error) {
    pinoLogger.error(
      { error, to: email },
      "Failed to queue verification email",
    );
    throw error;
  }
}

/**
 * Queue password reset email with higher priority
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  try {
    const job = await addPasswordResetEmailJob({
      to: email,
      resetUrl,
    });
    pinoLogger.info(
      { jobId: job.id, to: email },
      "Password reset email queued successfully",
    );
    return { success: true, jobId: job.id };
  } catch (error) {
    pinoLogger.error(
      { error, to: email },
      "Failed to queue password reset email",
    );
    throw error;
  }
}

export async function verifySmtpConnection(): Promise<{
  status: string;
  error: string | null;
}> {
  try {
    const transport = getTransporter();
    await transport.verify();
    pinoLogger.info("SMTP connection verified successfully");
    return { status: "connected", error: null };
  } catch (error) {
    pinoLogger.error({ error }, "SMTP connection verification failed");
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
