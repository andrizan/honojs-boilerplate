import type { Context, Next } from "hono";
import { HTTP_STATUS } from "../constants.js";
import { logger } from "../logger.js";

/**
 * Global error handling middleware.
 * Catches all errors thrown in the application and returns a consistent error response.
 */
export const errorHandler = async (c: Context, next: Next) => {
	try {
		await next();
	} catch (err) {
		const error = err as Error;

		logger.error({
			error: error.message,
			stack: error.stack,
			path: c.req.path,
			method: c.req.method,
		});

		return c.json(
			{
				success: false,
				error: error.message || "Internal server error",
			},
			HTTP_STATUS.INTERNAL_SERVER_ERROR,
		);
	}
};
