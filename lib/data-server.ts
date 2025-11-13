import "server-only";
import { cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema/schema";
import { eq, inArray } from "drizzle-orm";
import { categories, postCategories } from "@/lib/db/schema/schema";

export async function getPublishedBlogs() {
    "use cache";
    cacheTag("blogs");

    const publishedBlogs = await db.query.posts.findMany({
        where: eq(posts.status, "published"),
        with: {
            author: {
                columns: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
            postCategories: {
                with: {
                    category: true,
                },
            },
        },
        orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return publishedBlogs.map((blog) => ({
        ...blog,
        createdAt: blog.createdAt.toISOString(),
        updatedAt: blog.updatedAt ? blog.updatedAt.toISOString() : null,
        postCategories: blog.postCategories.map((pc) => ({
            ...pc,
            createdAt: pc.createdAt.toISOString(),
            category: {
                ...pc.category,
                createdAt: pc.category.createdAt.toISOString(),
            },
        })),
    }));
}

/**
 * Fetch single blog by slug
 */
export async function getBlogBySlug(slug: string) {
    "use cache";
    cacheTag("blog", `blog-${slug}`);

    const blog = await db.query.posts.findFirst({
        where: eq(posts.slug, slug),
        with: {
            author: {
                columns: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
            postCategories: {
                with: {
                    category: true,
                },
            },
        },
    });

    return blog;
}

/**
 * Fetch blogs by author ID
 */
export async function getBlogsByAuthor(authorId: string) {
    "use cache";
    cacheTag("blogs", `author-${authorId}`);

    const authorBlogs = await db.query.posts.findMany({
        where: eq(posts.authorId, authorId),
        with: {
            author: {
                columns: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
            postCategories: {
                with: {
                    category: true,
                },
            },
        },
        orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return authorBlogs;
}

/**
 * Fetch blogs by category slug
 */
export async function getBlogsByCategory(categorySlug: string) {
    "use cache";
    cacheTag("blogs", `category-${categorySlug}`);

    const subquery = db
        .select({ postId: postCategories.postId })
        .from(postCategories)
        .leftJoin(categories, eq(postCategories.categoryId, categories.id))
        .where(eq(categories.slug, categorySlug));

    const categoryBlogs = await db.query.posts.findMany({
        where: inArray(posts.id, subquery),
        with: {
            author: {
                columns: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
            postCategories: {
                with: {
                    category: true,
                },
            },
        },
        orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return categoryBlogs;
}

/**
 * Fetch all categories with caching
 */
export async function getAllCategories() {
    "use cache";
    cacheTag("categories");

    const allCategories = await db.query.categories.findMany({
        orderBy: (categories, { asc }) => [asc(categories.name)],
    });

    return allCategories;
}