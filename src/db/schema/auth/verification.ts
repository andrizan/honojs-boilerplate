import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const verification = pgTable(
  "verification",
  {
    id: uuid("id").primaryKey().$defaultFn(uuidv7),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (t) => [index("idx_verification_identifier").on(t.identifier)],
);

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;
