import { boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

// ============================================
// BETTER AUTH TABLES
// ============================================
// Tables required by Better Auth for authentication

export const user = pgTable(
	"user",
	{
		id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
		name: text("name").notNull(),
		email: text("email").notNull().unique(),
		emailVerified: boolean("emailVerified").notNull().default(false),
		image: text("image"),
		role: text("role").default("user").notNull(),
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(table) => [index("idx_user_email").on(table.email)],
);

export const session = pgTable(
	"session",
	{
		id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
		expiresAt: timestamp("expiresAt").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
		ipAddress: text("ipAddress"),
		userAgent: text("userAgent"),
		userId: uuid("userId")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("idx_session_token").on(table.token)],
);

export const account = pgTable(
	"account",
	{
		id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
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
	(table) => [
		index("idx_account_user").on(table.userId),
		index("idx_account_provider").on(table.providerId, table.accountId),
	],
);

export const verification = pgTable(
	"verification",
	{
		id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expiresAt").notNull(),
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(table) => [index("idx_verification_identifier").on(table.identifier)],
);

// ============================================
// TYPE EXPORTS
// ============================================

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

// ============================================
// CUSTOM TABLES
// ============================================

export const blogs = pgTable(
	"blogs",
	{
		id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
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
	(table) => [
		index("idx_blogs_author").on(table.authorId),
		index("idx_blogs_slug").on(table.slug),
		index("idx_blogs_published").on(table.published),
	],
);

export type Blog = typeof blogs.$inferSelect;
export type NewBlog = typeof blogs.$inferInsert;
