import {
  pgTable,
  text,
  boolean,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const user = pgTable(
  "user",
  {
    id: uuid("id").primaryKey().$defaultFn(uuidv7),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("emailVerified").default(false).notNull(),
    image: text("image"),
    role: text("role").default("user").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (t) => [index("idx_user_email").on(t.email)],
);

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
