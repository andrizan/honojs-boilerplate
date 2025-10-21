import { Hono } from "hono";
import { betterAuthMiddleware } from "../../shared/middlewares/better-auth.middleware.js";
import {
	standardUserRateLimit,
	strictUserRateLimit,
	relaxedUserRateLimit,
} from "../../shared/middlewares/user-rate-limit.middleware.js";
import {
	createBlog,
	getAllBlogs,
	getBlogById,
	getBlogBySlug,
	getMyBlogs,
	updateBlog,
	deleteBlog,
} from "./blog.controller.js";

const blogRouter = new Hono();

// Public routes (no user rate limit, uses global IP-based rate limit)
blogRouter.get("/", getAllBlogs);
blogRouter.get("/slug/:slug", getBlogBySlug);
blogRouter.get("/:id", getBlogById);

// Protected routes (user-based rate limiting)
// Create blog (strict - prevent spam)
blogRouter.post("/", betterAuthMiddleware, strictUserRateLimit(), createBlog);

// Read user's blogs (relaxed - read-heavy)
blogRouter.get("/my/blogs", betterAuthMiddleware, relaxedUserRateLimit(), getMyBlogs);

// Update/Delete (standard limit)
blogRouter.patch("/:id", betterAuthMiddleware, standardUserRateLimit(), updateBlog);
blogRouter.delete("/:id", betterAuthMiddleware, standardUserRateLimit(), deleteBlog);

export default blogRouter;
