import type { Context } from "hono";
import { BlogService } from "@/modules/blog/blog.service";
import { parsePaginationQuery } from "@/utils/pagination";
import { sendError, sendSuccess } from "@/helpers/response";

const blogService = new BlogService();

export const createBlog = async (c: Context) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();

    const { title, slug, content, excerpt, coverImage, published } = body;

    if (!title || !content) {
      return sendError(c, "Title and content are required", 400);
    }

    const finalSlug = slug || blogService.generateSlug(title);

    const blog = await blogService.createBlog({
      title,
      slug: finalSlug,
      content,
      excerpt,
      coverImage,
      published: published || false,
      authorId: user.id,
    });

    return sendSuccess(c, blog, 201, "Blog created successfully");
  } catch (err) {
    return sendError(
      c,
      err instanceof Error ? err.message : "Failed to create blog",
      400,
    );
  }
};

export const getAllBlogs = async (c: Context) => {
  try {
    const { page, limit } = parsePaginationQuery(
      c.req.query("page"),
      c.req.query("limit"),
    );
    const publishedOnly = c.req.query("published") === "true";

    const result = await blogService.getAllBlogs(page, limit, publishedOnly);
    return sendSuccess(c, result, 200, "Blogs fetched successfully");
  } catch (err) {
    return sendError(
      c,
      err instanceof Error ? err.message : "Failed to fetch blogs",
      500,
    );
  }
};

export const getBlogById = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const blog = await blogService.getBlogById(id);
    return sendSuccess(c, blog, 200, "Blog fetched successfully");
  } catch (err) {
    return sendError(c, err instanceof Error ? err.message : "Blog not found");
  }
};

export const getBlogBySlug = async (c: Context) => {
  try {
    const slug = c.req.param("slug");
    const blog = await blogService.getBlogBySlug(slug);
    return sendSuccess(c, blog, 200, "Blog fetched successfully");
  } catch (err) {
    return sendError(c, err instanceof Error ? err.message : "Blog not found");
  }
};

export const getMyBlogs = async (c: Context) => {
  try {
    const user = c.get("user");
    const { page, limit } = parsePaginationQuery(
      c.req.query("page"),
      c.req.query("limit"),
    );

    const result = await blogService.getBlogsByAuthor(user.id, page, limit);
    return sendSuccess(c, result, 200, "Blogs fetched successfully");
  } catch (err) {
    return sendError(
      c,
      err instanceof Error ? err.message : "Failed to fetch blogs",
      500,
    );
  }
};

export const updateBlog = async (c: Context) => {
  try {
    const user = c.get("user");
    const id = c.req.param("id");
    const body = await c.req.json();

    const { title, slug, content, excerpt, coverImage, published } = body;

    const blog = await blogService.updateBlog(
      id,
      {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        published,
      },
      user.id,
    );

    return sendSuccess(c, blog, 200, "Blog updated successfully");
  } catch (err) {
    return sendError(
      c,
      err instanceof Error ? err.message : "Failed to update blog",
      400,
    );
  }
};

export const deleteBlog = async (c: Context) => {
  try {
    const user = c.get("user");
    const id = c.req.param("id");

    await blogService.deleteBlog(id, user.id);
    return sendSuccess(c, null, 200, "Blog deleted successfully");
  } catch (err) {
    return sendError(
      c,
      err instanceof Error ? err.message : "Failed to delete blog",
      400,
    );
  }
};
