import { count, desc, eq, and, sql } from "drizzle-orm";
import { db } from "@/libs/postgres";
import type { Blog, NewBlog } from "@/modules/blog/blog.model";
import { blogs } from "@/modules/blog/blog.model";
import { user } from "@/db/schema/auth/user";

export class BlogRepository {
  async create(data: NewBlog): Promise<Blog> {
    const [blog] = await db.insert(blogs).values(data).returning();
    return blog!;
  }

  async findById(id: string): Promise<Blog | undefined> {
    const [blog] = await db
      .select({
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        content: blogs.content,
        excerpt: blogs.excerpt,
        coverImage: blogs.coverImage,
        published: blogs.published,
        publishedAt: blogs.publishedAt,
        authorId: blogs.authorId,
        createdAt: blogs.createdAt,
        updatedAt: blogs.updatedAt,
        author: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(blogs)
      .leftJoin(user, eq(blogs.authorId, user.id))
      .where(eq(blogs.id, id))
      .limit(1);

    return blog as Blog | undefined;
  }

  async findBySlug(slug: string): Promise<Blog | undefined> {
    const [blog] = await db
      .select({
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        content: blogs.content,
        excerpt: blogs.excerpt,
        coverImage: blogs.coverImage,
        published: blogs.published,
        publishedAt: blogs.publishedAt,
        authorId: blogs.authorId,
        createdAt: blogs.createdAt,
        updatedAt: blogs.updatedAt,
        author: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(blogs)
      .leftJoin(user, eq(blogs.authorId, user.id))
      .where(eq(blogs.slug, slug))
      .limit(1);

    return blog as Blog | undefined;
  }

  async findAll(
    limit: number,
    offset: number,
    publishedOnly = false,
  ): Promise<{ blogs: Blog[]; total: number }> {
    const conditions = publishedOnly ? eq(blogs.published, true) : undefined;

    const [blogsResult, totalResult] = await Promise.all([
      db
        .select({
          id: blogs.id,
          title: blogs.title,
          slug: blogs.slug,
          content: blogs.content,
          excerpt: blogs.excerpt,
          coverImage: blogs.coverImage,
          published: blogs.published,
          publishedAt: blogs.publishedAt,
          authorId: blogs.authorId,
          createdAt: blogs.createdAt,
          updatedAt: blogs.updatedAt,
          author: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
        })
        .from(blogs)
        .leftJoin(user, eq(blogs.authorId, user.id))
        .where(conditions)
        .orderBy(desc(blogs.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(blogs).where(conditions),
    ]);

    const total = Number(totalResult?.[0]?.total ?? 0);

    return {
      blogs: blogsResult as Blog[],
      total,
    };
  }

  async findByAuthor(
    authorId: string,
    limit: number,
    offset: number,
  ): Promise<{ blogs: Blog[]; total: number }> {
    const [blogsResult, totalResult] = await Promise.all([
      db
        .select({
          id: blogs.id,
          title: blogs.title,
          slug: blogs.slug,
          content: blogs.content,
          excerpt: blogs.excerpt,
          coverImage: blogs.coverImage,
          published: blogs.published,
          publishedAt: blogs.publishedAt,
          authorId: blogs.authorId,
          createdAt: blogs.createdAt,
          updatedAt: blogs.updatedAt,
          author: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
        })
        .from(blogs)
        .leftJoin(user, eq(blogs.authorId, user.id))
        .where(eq(blogs.authorId, authorId))
        .orderBy(desc(blogs.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(blogs)
        .where(eq(blogs.authorId, authorId)),
    ]);

    const total = Number(totalResult?.[0]?.total ?? 0);

    return {
      blogs: blogsResult as Blog[],
      total,
    };
  }

  async update(
    id: string,
    data: Partial<Omit<Blog, "id" | "authorId" | "createdAt">>,
  ): Promise<Blog | undefined> {
    const [blog] = await db
      .update(blogs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(blogs.id, id))
      .returning();

    return blog;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(blogs).where(eq(blogs.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const conditions = excludeId
      ? and(eq(blogs.slug, slug), sql`${blogs.id} != ${excludeId}`)
      : eq(blogs.slug, slug);

    const [result] = await db
      .select({ count: count() })
      .from(blogs)
      .where(conditions);

    return Number(result?.count ?? 0) > 0;
  }
}
