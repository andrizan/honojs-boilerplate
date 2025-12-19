import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { user } from "@/db/schema/auth/user";

export const account = pgTable(
  "account",
  {
    id: uuid("id").primaryKey().$defaultFn(uuidv7),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (t) => [
    index("idx_account_user").on(t.userId),
    index("idx_account_provider").on(t.providerId, t.accountId),
  ],
);

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
