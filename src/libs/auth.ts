import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../infrastructure/db.js";
import { env } from "../infrastructure/env.js";
import {
	sendVerificationEmail,
	sendPasswordResetEmail,
} from "./email.js";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	baseURL: `${env.APP_URL}:${env.APP_PORT}`,
	secret: env.BETTER_AUTH_SECRET,
	trustedOrigins: [env.APP_URL, `${env.APP_URL}:${env.APP_PORT}`],
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
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
		facebook: {
			clientId: env.FACEBOOK_CLIENT_ID,
			clientSecret: env.FACEBOOK_CLIENT_SECRET,
		},
		discord: {
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET,
		},
	},
	advanced: {
		generateId: false, // Use database generated IDs
		useSecureCookies: env.NODE_ENV === "production",
		crossSubDomainCookies: {
			enabled: false,
		},
	},
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
