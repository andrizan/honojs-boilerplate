import { Hono } from "hono";
import { betterAuthMiddleware } from "../../shared/middlewares/better-auth.middleware.js";
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

// Public routes
blogRouter.get("/", getAllBlogs);
blogRouter.get("/slug/:slug", getBlogBySlug);
blogRouter.get("/:id", getBlogById);

// Protected routes (require authentication)
blogRouter.post("/", betterAuthMiddleware, createBlog);
blogRouter.get("/my/blogs", betterAuthMiddleware, getMyBlogs);
blogRouter.patch("/:id", betterAuthMiddleware, updateBlog);
blogRouter.delete("/:id", betterAuthMiddleware, deleteBlog);

export default blogRouter;
