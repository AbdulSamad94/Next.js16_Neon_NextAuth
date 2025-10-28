import { pgTable, uuid, varchar, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const postStatusEnum = pgEnum("post_status", ["draft", "published"]);

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }),
    email: varchar("email", { length: 100 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }),
    image: text("image"),
    provider: varchar("provider", { length: 50 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 100 }),
    role: roleEnum("role").default("user").notNull(),
    bio: text("bio").default("Hey there! I'm new on BlogHub").notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at")
        .default(sql`CURRENT_TIMESTAMP`)
        .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export const posts = pgTable("posts", {
    id: uuid("id").defaultRandom().primaryKey(),
    authorId: uuid("author_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    content: text("content").notNull(),
    excerpt: text("excerpt"),
    coverImage: text("cover_image"),
    status: postStatusEnum("status").default("draft").notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at")
        .default(sql`CURRENT_TIMESTAMP`)
        .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export const usersRelations = relations(users, ({ many }) => ({
    posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
    author: one(users, {
        fields: [posts.authorId],
        references: [users.id],
    }),
}));

// Type exports for use in the application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;