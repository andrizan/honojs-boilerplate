import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { users } from "../db/schema.js";
import { db } from "../lib/db.js";

export const GetUserProfile = async (c: Context) => {
	const user = c.get("user");

	const data = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			picture: users.picture,
			provider: users.provider,
			role: users.role,
			createdAt: users.createdAt,
		})
		.from(users)
		.where(eq(users.email, user.email))
		.execute();
	return c.json({
		data: data,
	});
};
