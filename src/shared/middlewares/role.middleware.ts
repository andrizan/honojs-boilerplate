import type { Context, Next } from "hono";
import { USER_ROLES } from "../constants.js";

/**
 * Middleware to check if user has required role(s).
 * Must be used after authMiddleware.
 *
 * @param allowedRoles - Array of roles that are allowed to access the route
 */
export const requireRole = (...allowedRoles: string[]) => {
	return async (c: Context, next: Next) => {
		const user = c.get("user");

		if (!user) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		if (!allowedRoles.includes(user.role)) {
			return c.json({ error: "Forbidden: Insufficient permissions" }, 403);
		}

		await next();
	};
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = requireRole(USER_ROLES.ADMIN);
