import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable(
	"users",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		email: text("email").unique().notNull(),
		name: text("name").notNull(),
		password: text("password"),
		picture: text("picture"),
		provider: text("provider").notNull(),
		role: text("role").default("user").notNull(),
		refreshToken: text("refresh_token").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		index("idx_users_email").on(table.email),
		index("idx_users_refresh_token").on(table.refreshToken),
	],
);
