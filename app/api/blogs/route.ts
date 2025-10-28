import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema/schema";
import { createBlogSchema } from "@/lib/validations/blog";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import slugify from "slugify";
import { eq } from "drizzle-orm";

async function generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = slugify(title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
    });

    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await db.query.posts.findFirst({
            where: eq(posts.slug, slug),
        });

        if (!existing) break;

        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, session.user.email),
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const body = await req.json();

        // Handle image upload if provided
        let coverImageUrl: string | null = null;
        if (body.coverImageBase64) {
            try {
                coverImageUrl = await uploadImageToCloudinary(
                    body.coverImageBase64,
                    body.coverImageType || "image/jpeg"
                );
            } catch (error) {
                console.error("Image upload failed:", error);
                return NextResponse.json(
                    { error: "Failed to upload cover image" },
                    { status: 500 }
                );
            }
        }

        // Prepare data for validation (without base64 fields)
        const dataToValidate = {
            title: body.title,
            excerpt: body.excerpt,
            content: body.content,
            coverImage: coverImageUrl || undefined,
            status: body.status,
        };

        const validatedData = createBlogSchema.parse(dataToValidate);

        const slug = await generateUniqueSlug(validatedData.title);

        const [newPost] = await db
            .insert(posts)
            .values({
                title: validatedData.title,
                slug,
                content: validatedData.content,
                excerpt: validatedData.excerpt || null,
                coverImage: validatedData.coverImage || null,
                status: validatedData.status,
                authorId: user.id,
            })
            .returning();

        return NextResponse.json({
            success: true,
            post: newPost,
        });
    } catch (error) {
        console.error("Create blog error:", error);

        if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json(
                { error: "Validation failed", details: error },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create blog post" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const authorId = searchParams.get("authorId");

        console.log("Fetching blogs with status:", status, "and authorId:", authorId);

        const query = db.query.posts.findMany({
            with: {
                author: {
                    columns: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
            orderBy: (posts, { desc }) => [desc(posts.createdAt)],
        });

        const allPosts = await query;

        return NextResponse.json({
            success: true,
            posts: allPosts,
        });
    } catch (error) {
        console.error("Fetch blogs error:", error);
        return NextResponse.json(
            { error: "Failed to fetch blog posts" },
            { status: 500 }
        );
    }
}