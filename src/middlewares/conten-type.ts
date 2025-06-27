import type { Context, Next } from "hono";

/**
 * Middleware to validate that incoming requests (except GET, HEAD, OPTIONS)
 * have the 'Content-Type' header set to 'application/json'.
 *
 * If the content type is missing or not 'application/json', responds with HTTP 415.
 *
 * @param c - The request context.
 * @param next - The next middleware function in the stack.
 * @returns A promise that resolves when the middleware is complete.
 */
export const validateJsonContentType = async (c: Context, next: Next) => {
	const method = c.req.method.toUpperCase();
	if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
		return next();
	}

	const contentType = c.req.header("content-type");
	if (!contentType || !contentType.includes("application/json")) {
		return c.json(
			{ error: "Unsupported content type, expected application/json" },
			415,
		);
	}

	await next();
};
