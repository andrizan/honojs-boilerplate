import { Hono } from "hono";
import { sValidator } from "@hono/standard-validator";
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
import { updateUserSchema } from "@/modules/user/user.dto";

const user = new Hono();
user.use("*", betterAuthMiddleware);

// profile
user.get("/profile", relaxedUserRateLimit(), getUserProfile);

// avatar
user.route(
  "/avatar",
  new Hono()
    .use(strictUserRateLimit())
    .post("/", uploadAvatar)
    .delete("/", deleteAvatar)
);

// admin
user.route(
  "/",
  new Hono()
    .use(requireAdmin)
    .use(standardUserRateLimit())
    .get("/", getAllUsers)
    .get("/:id", getUserById)
    .patch("/:id", sValidator("json", updateUserSchema), updateUser)
    .delete("/:id", deleteUser)
);

export default user;
