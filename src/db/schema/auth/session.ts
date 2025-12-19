import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { user } from "@/db/schema/auth/user";

export const session = pgTable(
  "session",
  {
    id: uuid("id").primaryKey().$defaultFn(uuidv7),
    expiresAt: timestamp("expiresAt").notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (t) => [index("idx_session_token").on(t.token)],
);

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
