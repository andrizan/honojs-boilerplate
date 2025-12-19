import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/libs/postgres";
import { type User, users } from "@/modules/user/user.model";

export class UserRepository {
  async findByEmail(email: string): Promise<User | undefined> {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        emailVerified: users.emailVerified,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.email, email))
      .execute();
    return result[0] as User | undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        emailVerified: users.emailVerified,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .execute();
    return result[0] as User | undefined;
  }

  async findAll(
    limit = 10,
    offset = 0,
  ): Promise<{ users: User[]; total: number }> {
    const [usersResult, countResult] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
          emailVerified: users.emailVerified,
          role: users.role,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset)
        .execute(),
      db.select({ count: sql<number>`count(*)` }).from(users).execute(),
    ]);

    return {
      users: usersResult as User[],
      total: Number(countResult[0]?.count || 0),
    };
  }

  async update(
    id: string,
    data: Partial<Pick<User, "name" | "image" | "role">>,
  ): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        emailVerified: users.emailVerified,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .execute();
    return result[0] as User | undefined;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).execute();
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
