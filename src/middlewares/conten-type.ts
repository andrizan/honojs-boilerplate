import type { Context, Next } from "hono";

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
