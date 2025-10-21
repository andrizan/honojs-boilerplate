import type { Context, Next } from "hono";
import { auth } from "../../libs/auth.js";

export const betterAuthMiddleware = async (c: Context, next: Next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	c.set("user", session.user);
	c.set("session", session.session);
	await next();
};
