import { z } from "zod";
import type { Blog } from "@/db/schema/blog";

// ============ Input DTOs ============
// DTOs untuk menerima data dari client

export const createBlogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  slug: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  published: z.boolean().optional(),
});

export const updateBlogSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  published: z.boolean().optional(),
});

export type CreateBlogDTO = z.infer<typeof createBlogSchema>;
export type UpdateBlogDTO = z.infer<typeof updateBlogSchema>;

// ============ Response DTOs ============
// DTOs untuk mengirim data ke client

export interface BlogResponseDTO {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  published: boolean;
  publishedAt: Date | null;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogListResponseDTO {
  data: BlogResponseDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============ Helpers ============
export function toBlogResponseDTO(blog: Blog): BlogResponseDTO {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    content: blog.content,
    excerpt: blog.excerpt,
    coverImage: blog.coverImage,
    published: blog.published,
    publishedAt: blog.publishedAt,
    authorId: blog.authorId,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  };
}
