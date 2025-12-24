import type { Blog } from "@/db/schema";
import type {
  CreateBlogDTO,
  UpdateBlogDTO,
  BlogResponseDTO,
  BlogListResponseDTO,
} from "@/modules/blog/blog.dto";
import { toBlogResponseDTO } from "@/modules/blog/blog.dto";
import { BlogRepository } from "@/modules/blog/blog.repository";
import { createPaginatedResponse, calculatePaginationOffset } from "@/utils/pagination";

export class BlogService {
  private repository: BlogRepository;

  constructor() {
    this.repository = new BlogRepository();
  }

  async createBlog(
    data: CreateBlogDTO,
    authorId: string,
    slug: string,
  ): Promise<BlogResponseDTO> {
    const slugExists = await this.repository.slugExists(slug);
    if (slugExists) {
      throw new Error("Slug already exists");
    }

    const published = data.published ?? false;
    const blogData = {
      ...data,
      slug,
      authorId,
      published,
      publishedAt: published ? new Date() : null,
    };

    const blog = await this.repository.create(blogData);
    return toBlogResponseDTO(blog);
  }

  async getBlogById(id: string): Promise<BlogResponseDTO> {
    const blog = await this.repository.findById(id);
    if (!blog) {
      throw new Error("Blog not found");
    }
    return toBlogResponseDTO(blog);
  }

  async getBlogBySlug(slug: string): Promise<BlogResponseDTO> {
    const blog = await this.repository.findBySlug(slug);
    if (!blog) {
      throw new Error("Blog not found");
    }
    return toBlogResponseDTO(blog);
  }

  async getAllBlogs(
    page = 1,
    limit = 10,
    publishedOnly = false,
  ): Promise<BlogListResponseDTO> {
    const offset = calculatePaginationOffset({ page, limit });
    const result = await this.repository.findAll(limit, offset, publishedOnly);

    return createPaginatedResponse(
      result.blogs.map(toBlogResponseDTO),
      result.total,
      page,
      limit,
    );
  }

  async getBlogsByAuthor(
    authorId: string,
    page = 1,
    limit = 10,
  ): Promise<BlogListResponseDTO> {
    const offset = calculatePaginationOffset({ page, limit });
    const result = await this.repository.findByAuthor(authorId, limit, offset);

    return createPaginatedResponse(
      result.blogs.map(toBlogResponseDTO),
      result.total,
      page,
      limit,
    );
  }

  async updateBlog(
    id: string,
    data: UpdateBlogDTO,
    authorId: string,
  ): Promise<BlogResponseDTO> {
    if (Object.keys(data).length === 0) {
      throw new Error("No fields to update");
    }

    const existing = await this.repository.findById(id);
    if (!existing) throw new Error("Blog not found");
    if (existing.authorId !== authorId) throw new Error("Unauthorized");

    if (data.slug && data.slug !== existing.slug) {
      const exists = await this.repository.slugExists(data.slug, id);
      if (exists) throw new Error("Slug already exists");
    }

    const updateData: Partial<Blog> = { ...data };

    // Set publishedAt when publishing for the first time
    if (data.published !== undefined && data.published && !existing.published) {
      updateData.publishedAt = new Date();
    }

    const updated = await this.repository.update(id, updateData);

    if (!updated) throw new Error("Update failed");
    return toBlogResponseDTO(updated);
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

}
