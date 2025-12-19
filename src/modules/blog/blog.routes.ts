import { Hono } from "hono";
import { betterAuthMiddleware } from "@/middlewares/better-auth.middleware";
import {
  standardUserRateLimit,
  strictUserRateLimit,
  relaxedUserRateLimit,
} from "@/middlewares/user-rate-limit.middleware";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  getMyBlogs,
  updateBlog,
  deleteBlog,
} from "@/modules/blog/blog.controller";

const blogRouter = new Hono();

// Public routes (no user rate limit, uses global IP-based rate limit)
blogRouter.get("/", getAllBlogs);
blogRouter.get("/slug/:slug", getBlogBySlug);
blogRouter.get("/:id", getBlogById);

// Protected routes (user-based rate limiting)
// Create blog (strict - prevent spam)
blogRouter.post("/", betterAuthMiddleware, strictUserRateLimit(), createBlog);

// Read user's blogs (relaxed - read-heavy)
blogRouter.get(
  "/my/blogs",
  betterAuthMiddleware,
  relaxedUserRateLimit(),
  getMyBlogs,
);

// Update/Delete (standard limit)
blogRouter.patch(
  "/:id",
  betterAuthMiddleware,
  standardUserRateLimit(),
  updateBlog,
);
blogRouter.delete(
  "/:id",
  betterAuthMiddleware,
  standardUserRateLimit(),
  deleteBlog,
);

export default blogRouter;
