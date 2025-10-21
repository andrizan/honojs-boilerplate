import { Hono } from "hono";
import { betterAuthMiddleware } from "../../shared/middlewares/better-auth.middleware.js";
import { requireAdmin } from "../../shared/middlewares/role.middleware.js";
import {
	deleteUser,
	getAllUsers,
	getUserById,
	getUserProfile,
	updateUser,
} from "./user.controller.js";
import { uploadAvatar, deleteAvatar } from "./avatar.controller.js";

const userRouter = new Hono();

userRouter.get("/profile", betterAuthMiddleware, getUserProfile);
userRouter.post("/avatar", betterAuthMiddleware, uploadAvatar);
userRouter.delete("/avatar", betterAuthMiddleware, deleteAvatar);

userRouter.get("/", betterAuthMiddleware, requireAdmin, getAllUsers);
userRouter.get("/:id", betterAuthMiddleware, requireAdmin, getUserById);
userRouter.patch("/:id", betterAuthMiddleware, requireAdmin, updateUser);
userRouter.delete("/:id", betterAuthMiddleware, requireAdmin, deleteUser);

export default userRouter;
