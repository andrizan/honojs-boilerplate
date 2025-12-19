import {
  pgTable,
  text,
  boolean,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { user } from "@/db/schema/auth/user";

export const blogs = pgTable(
  "blogs",
  {
    id: uuid("id").primaryKey().$defaultFn(uuidv7),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    content: text("content").notNull(),
    excerpt: text("excerpt"),
    coverImage: text("coverImage"),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("publishedAt"),
    authorId: uuid("authorId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (t) => [
    index("idx_blogs_author").on(t.authorId),
    index("idx_blogs_slug").on(t.slug),
    index("idx_blogs_published").on(t.published),
  ],
);

export type Blog = typeof blogs.$inferSelect;
export type NewBlog = typeof blogs.$inferInsert;
