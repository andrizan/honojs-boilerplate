import type { Context, Next } from "hono";
import { verify } from "hono/jwt";

export const jwtMiddleware = async (c: Context, next: Next) => {
	const auth = c.req.header("Authorization");
	if (!auth || !auth.startsWith("Bearer ")) {
		return c.json({ error: "Unauthorized" }, 401);
	}
	const token = auth.replace("Bearer ", "");
	try {
		const payload = await verify(token, process.env.JWT_SECRET_KEY || "");

		c.set("user", payload);
		await next();
	} catch {
		return c.json({ error: "Invalid or expired token" }, 401);
	}
};
