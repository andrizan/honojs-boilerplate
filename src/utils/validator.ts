import * as z from "zod/v4";

export const userValidator = z.object({
	email: z.email(),
	name: z.string().min(3),
	password: z.string().min(8),
	picture: z.url().optional().optional(),
	provider: z.string().min(1).default("system"),
	role: z.enum(["user", "admin"]).default("user")
});
