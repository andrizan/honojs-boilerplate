import type { Blog } from "./blog.model.js";
import { BlogRepository } from "./blog.repository.js";

export class BlogService {
	private repository: BlogRepository;

	constructor() {
		this.repository = new BlogRepository();
	}

	async createBlog(data: {
		title: string;
		slug: string;
		content: string;
		excerpt?: string;
		coverImage?: string;
		published?: boolean;
		authorId: string;
	}): Promise<Blog> {
		const slugExists = await this.repository.slugExists(data.slug);
		if (slugExists) {
			throw new Error("Slug already exists");
		}

		const publishedAt = data.published ? new Date() : null;

		return this.repository.create({
			...data,
			publishedAt,
		});
	}

	async getBlogById(id: string): Promise<Blog> {
		const blog = await this.repository.findById(id);
		if (!blog) {
			throw new Error("Blog not found");
		}
		return blog;
	}

	async getBlogBySlug(slug: string): Promise<Blog> {
		const blog = await this.repository.findBySlug(slug);
		if (!blog) {
			throw new Error("Blog not found");
		}
		return blog;
	}

	async getAllBlogs(
		page = 1,
		limit = 10,
		publishedOnly = false,
	): Promise<{
		blogs: Blog[];
		pagination: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		};
	}> {
		const offset = (page - 1) * limit;
		const result = await this.repository.findAll(limit, offset, publishedOnly);

		return {
			blogs: result.blogs,
			pagination: {
				page,
				limit,
				total: result.total,
				totalPages: Math.ceil(result.total / limit),
			},
		};
	}

	async getBlogsByAuthor(
		authorId: string,
		page = 1,
		limit = 10,
	): Promise<{
		blogs: Blog[];
		pagination: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		};
	}> {
		const offset = (page - 1) * limit;
		const result = await this.repository.findByAuthor(authorId, limit, offset);

		return {
			blogs: result.blogs,
			pagination: {
				page,
				limit,
				total: result.total,
				totalPages: Math.ceil(result.total / limit),
			},
		};
	}

	async updateBlog(
		id: string,
		data: {
			title?: string;
			slug?: string;
			content?: string;
			excerpt?: string;
			coverImage?: string;
			published?: boolean;
		},
		authorId: string,
	): Promise<Blog> {
		const existingBlog = await this.repository.findById(id);
		if (!existingBlog) {
			throw new Error("Blog not found");
		}

		if (existingBlog.authorId !== authorId) {
			throw new Error("Unauthorized: You can only update your own blogs");
		}

		if (data.slug && data.slug !== existingBlog.slug) {
			const slugExists = await this.repository.slugExists(data.slug, id);
			if (slugExists) {
				throw new Error("Slug already exists");
			}
		}

		const publishedAt =
			data.published && !existingBlog.published
				? new Date()
				: existingBlog.publishedAt;

		const updated = await this.repository.update(id, {
			...data,
			publishedAt,
		});

		if (!updated) {
			throw new Error("Failed to update blog");
		}

		return updated;
	}

	async deleteBlog(id: string, authorId: string): Promise<void> {
		const blog = await this.repository.findById(id);
		if (!blog) {
			throw new Error("Blog not found");
		}

		if (blog.authorId !== authorId) {
			throw new Error("Unauthorized: You can only delete your own blogs");
		}

		const deleted = await this.repository.delete(id);
		if (!deleted) {
			throw new Error("Failed to delete blog");
		}
	}

	generateSlug(title: string): string {
		return title
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, "")
			.replace(/[\s_-]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}
}
