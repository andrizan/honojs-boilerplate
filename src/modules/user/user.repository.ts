import { desc, eq, count } from "drizzle-orm";
import { db } from "@/libs/postgres";
import { type User, user as users } from "@/db/schema/auth/user";

export class UserRepository {
  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user;
  }

  async findById(id: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user;
  }

  async findAll(
    limit = 10,
    offset = 0,
  ): Promise<{ users: User[]; total: number }> {
    const [usersResult, totalResult] = await Promise.all([
      db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(users),
    ]);

    return {
      users: usersResult,
      total: Number(totalResult[0]?.total ?? 0),
    };
  }

  async update(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
