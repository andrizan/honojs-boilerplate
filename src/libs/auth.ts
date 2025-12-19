import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/libs/postgres";
import { envSchema } from "@/config/env";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/libs/email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  baseURL: `${envSchema.APP_HOST}:${envSchema.APP_PORT}`,
  secret: envSchema.BETTER_AUTH_SECRET,
  trustedOrigins: [
    envSchema.APP_HOST,
    `${envSchema.APP_HOST}:${envSchema.APP_PORT}`,
  ],
  session: {
    expiresIn: 60 * 15, // 15 minutes for access token
    updateAge: 0, // Disable session update on every request
    cookieCache: {
      enabled: false, // Disable cookie for API mode
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
  },
  socialProviders: {
    google: {
      clientId: envSchema.GOOGLE_CLIENT_ID,
      clientSecret: envSchema.GOOGLE_CLIENT_SECRET,
    },
    facebook: {
      clientId: envSchema.FACEBOOK_CLIENT_ID,
      clientSecret: envSchema.FACEBOOK_CLIENT_SECRET,
    },
    discord: {
      clientId: envSchema.DISCORD_CLIENT_ID,
      clientSecret: envSchema.DISCORD_CLIENT_SECRET,
    },
  },
  advanced: {
    generateId: false, // Use database generated IDs
    useSecureCookies: envSchema.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
