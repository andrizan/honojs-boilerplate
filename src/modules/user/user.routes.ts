import { Hono } from "hono";
import { betterAuthMiddleware } from "@/middlewares/better-auth.middleware";
import { requireAdmin } from "@/middlewares/role.middleware";
import {
  standardUserRateLimit,
  strictUserRateLimit,
  relaxedUserRateLimit,
} from "@/middlewares/user-rate-limit.middleware";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  getUserProfile,
  updateUser,
} from "@/modules/user/user.controller";
import { uploadAvatar, deleteAvatar } from "@/modules/user/avatar.controller";

const userRouter = new Hono();

// User profile (read-heavy, relaxed limit)
userRouter.get(
  "/profile",
  betterAuthMiddleware,
  relaxedUserRateLimit(),
  getUserProfile,
);

// Avatar operations (sensitive, strict limit)
userRouter.post(
  "/avatar",
  betterAuthMiddleware,
  strictUserRateLimit(),
  uploadAvatar,
);
userRouter.delete(
  "/avatar",
  betterAuthMiddleware,
  strictUserRateLimit(),
  deleteAvatar,
);

// Admin operations (standard limit)
userRouter.get(
  "/",
  betterAuthMiddleware,
  requireAdmin,
  standardUserRateLimit(),
  getAllUsers,
);
userRouter.get(
  "/:id",
  betterAuthMiddleware,
  requireAdmin,
  standardUserRateLimit(),
  getUserById,
);
userRouter.patch(
  "/:id",
  betterAuthMiddleware,
  requireAdmin,
  standardUserRateLimit(),
  updateUser,
);
userRouter.delete(
  "/:id",
  betterAuthMiddleware,
  requireAdmin,
  standardUserRateLimit(),
  deleteUser,
);

export default userRouter;
