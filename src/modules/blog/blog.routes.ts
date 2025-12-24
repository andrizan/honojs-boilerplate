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
import { sValidator } from "@hono/standard-validator";
import { createBlogSchema, updateBlogSchema } from "@/modules/blog/blog.dto";

const blog = new Hono();

/* public */
blog.get("/", getAllBlogs);
blog.get("/slug/:slug", getBlogBySlug);
blog.get("/:id", getBlogById);

blog.use("*", betterAuthMiddleware);

/* strict */
blog.route(
  "/",
  new Hono()
    .use(strictUserRateLimit(), sValidator("json", createBlogSchema))
    .post("/", createBlog)
);

/* relaxed */
blog.route(
  "/",
  new Hono()
    .use(relaxedUserRateLimit())
    .get("/my/blogs", getMyBlogs)
);

/* standard */
blog.route(
  "/",
  new Hono()
    .use(standardUserRateLimit())
    .patch(":id", sValidator("json", updateBlogSchema), updateBlog)
    .delete("/:id", deleteBlog)
);

export default blog;
