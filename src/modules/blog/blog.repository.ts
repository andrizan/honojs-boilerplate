import { count, desc, eq, and, sql } from "drizzle-orm";
import { db } from "@/libs/postgres";
import { blogs, type Blog, type NewBlog } from "@/db/schema/blog";

export class BlogRepository {
  async create(data: NewBlog): Promise<Blog> {
    const [blog] = await db.insert(blogs).values(data).returning();
    return blog!;
  }

  async findById(id: string): Promise<Blog | undefined> {
    const [blog] = await db.select().from(blogs).where(eq(blogs.id, id)).limit(1);
    return blog;
  }

  async findBySlug(slug: string): Promise<Blog | undefined> {
    const [blog] = await db
      .select()
      .from(blogs)
      .where(eq(blogs.slug, slug))
      .limit(1);

    return blog;
  }

  async findAll(
    limit: number,
    offset: number,
    publishedOnly = false,
  ): Promise<{ blogs: Blog[]; total: number }> {
    const condition = publishedOnly ? eq(blogs.published, true) : undefined;

    const listQuery = db
      .select()
      .from(blogs)
      .orderBy(desc(blogs.createdAt))
      .limit(limit)
      .offset(offset);

    const totalQuery = db.select({ total: count() }).from(blogs);

    const [blogsResult, totalResult] = await Promise.all([
      condition ? listQuery.where(condition) : listQuery,
      condition ? totalQuery.where(condition) : totalQuery,
    ]);

    const total = Number(totalResult?.[0]?.total ?? 0);

    return {
      blogs: blogsResult,
      total,
    };
  }

  async findByAuthor(
    authorId: string,
    limit: number,
    offset: number,
  ): Promise<{ blogs: Blog[]; total: number }> {
    const listQuery = db
      .select()
      .from(blogs)
      .where(eq(blogs.authorId, authorId))
      .orderBy(desc(blogs.createdAt))
      .limit(limit)
      .offset(offset);

    const totalQuery = db
      .select({ total: count() })
      .from(blogs)
      .where(eq(blogs.authorId, authorId));

    const [blogsResult, totalResult] = await Promise.all([listQuery, totalQuery]);

    const total = Number(totalResult?.[0]?.total ?? 0);

    return {
      blogs: blogsResult,
      total,
    };
  }

  async update(
    id: string,
    data: Partial<Blog>,
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
