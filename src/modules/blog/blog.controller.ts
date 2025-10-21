import type { Context } from "hono";
import * as response from "../../shared/response.js";
import { BlogService } from "./blog.service.js";

const blogService = new BlogService();

export const createBlog = async (c: Context) => {
	try {
		const user = c.get("user");
		const body = await c.req.json();

		const { title, slug, content, excerpt, coverImage, published } = body;

		if (!title || !content) {
			return response.error(c, "Title and content are required", 400);
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

		return response.success(c, blog, "Blog created successfully", 201);
	} catch (err) {
		return response.error(
			c,
			err instanceof Error ? err.message : "Failed to create blog",
			400,
		);
	}
};

export const getAllBlogs = async (c: Context) => {
	try {
		const page = Number.parseInt(c.req.query("page") || "1");
		const limit = Number.parseInt(c.req.query("limit") || "10");
		const publishedOnly = c.req.query("published") === "true";

		const result = await blogService.getAllBlogs(page, limit, publishedOnly);
		return response.success(c, result);
	} catch (err) {
		return response.error(
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
		return response.success(c, blog);
	} catch (err) {
		return response.notFound(
			c,
			err instanceof Error ? err.message : "Blog not found",
		);
	}
};

export const getBlogBySlug = async (c: Context) => {
	try {
		const slug = c.req.param("slug");
		const blog = await blogService.getBlogBySlug(slug);
		return response.success(c, blog);
	} catch (err) {
		return response.notFound(
			c,
			err instanceof Error ? err.message : "Blog not found",
		);
	}
};

export const getMyBlogs = async (c: Context) => {
	try {
		const user = c.get("user");
		const page = Number.parseInt(c.req.query("page") || "1");
		const limit = Number.parseInt(c.req.query("limit") || "10");

		const result = await blogService.getBlogsByAuthor(user.id, page, limit);
		return response.success(c, result);
	} catch (err) {
		return response.error(
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

		return response.success(c, blog, "Blog updated successfully");
	} catch (err) {
		return response.error(
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
		return response.success(c, null, "Blog deleted successfully");
	} catch (err) {
		return response.error(
			c,
			err instanceof Error ? err.message : "Failed to delete blog",
			400,
		);
	}
};
