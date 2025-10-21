import type { Context, Next } from "hono";

/**
 * Middleware to validate that incoming requests (except GET, HEAD, OPTIONS)
 * have a valid 'Content-Type' header (application/json or multipart/form-data).
 *
 * If the content type is missing or not supported, responds with HTTP 415.
 *
 * @param c - The request context.
 * @param next - The next middleware function in the stack.
 * @returns A promise that resolves when the middleware is complete.
 */
export const validateContentType = async (c: Context, next: Next) => {
	const method = c.req.method.toUpperCase();
	if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
		return next();
	}

	const contentType = c.req.header("content-type");
	if (!contentType) {
		return c.json(
			{
				error:
					"Content-Type header is required. Supported: application/json, multipart/form-data",
			},
			415,
		);
	}

	const isJson = contentType.includes("application/json");
	const isFormData = contentType.includes("multipart/form-data");

	if (!isJson && !isFormData) {
		return c.json(
			{
				error:
					"Unsupported content type. Supported: application/json, multipart/form-data",
			},
			415,
		);
	}

	await next();
};
