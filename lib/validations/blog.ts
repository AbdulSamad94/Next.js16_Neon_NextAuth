import { z } from "zod";

export const createBlogSchema = z.object({
    title: z
        .string()
        .min(5, "Title must be at least 5 characters")
        .max(200, "Title is too long"),
    excerpt: z
        .string()
        .min(10, "Excerpt must be at least 10 characters")
        .max(500, "Excerpt is too long")
        .optional(),
    content: z.string().min(50, "Content must be at least 50 characters"),
    coverImage: z.string().url("Invalid image URL").optional(),
    status: z.enum(["draft", "published"]).default("draft"),
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;