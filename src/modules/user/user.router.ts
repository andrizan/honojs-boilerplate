import { Hono } from "hono";
import { betterAuthMiddleware } from "../../shared/middlewares/better-auth.middleware.js";
import { requireAdmin } from "../../shared/middlewares/role.middleware.js";
import {
	standardUserRateLimit,
	strictUserRateLimit,
	relaxedUserRateLimit,
} from "../../shared/middlewares/user-rate-limit.middleware.js";
import {
	deleteUser,
	getAllUsers,
	getUserById,
	getUserProfile,
	updateUser,
} from "./user.controller.js";
import { uploadAvatar, deleteAvatar } from "./avatar.controller.js";

const userRouter = new Hono();

// User profile (read-heavy, relaxed limit)
userRouter.get("/profile", betterAuthMiddleware, relaxedUserRateLimit(), getUserProfile);

// Avatar operations (sensitive, strict limit)
userRouter.post("/avatar", betterAuthMiddleware, strictUserRateLimit(), uploadAvatar);
userRouter.delete("/avatar", betterAuthMiddleware, strictUserRateLimit(), deleteAvatar);

// Admin operations (standard limit)
userRouter.get("/", betterAuthMiddleware, requireAdmin, standardUserRateLimit(), getAllUsers);
userRouter.get("/:id", betterAuthMiddleware, requireAdmin, standardUserRateLimit(), getUserById);
userRouter.patch("/:id", betterAuthMiddleware, requireAdmin, standardUserRateLimit(), updateUser);
userRouter.delete("/:id", betterAuthMiddleware, requireAdmin, standardUserRateLimit(), deleteUser);

export default userRouter;
