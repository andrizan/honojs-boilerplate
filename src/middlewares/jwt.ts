import type { Context, Next } from "hono";
import { verify } from "hono/jwt";

/**
 * Middleware to validate JWT tokens in the Authorization header.
 *
 * Checks for a Bearer token in the `Authorization` header of the request.
 * If the token is present and valid, attaches the decoded payload to the context under the "user" key and calls the next middleware.
 * If the token is missing, invalid, or expired, responds with a 401 Unauthorized error.
 *
 * @param c - The request context.
 * @param next - The next middleware function in the stack.
 * @returns A promise that resolves when the middleware is complete, or responds with a 401 error if authentication fails.
 */
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
