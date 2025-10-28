import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema/schema";
import { eq } from "drizzle-orm";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        if (!slug) {
            return NextResponse.json(
                { error: "Slug is required" },
                { status: 400 }
            );
        }

        const post = await db.query.posts.findFirst({
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
            },
        });

        if (!post) {
            return NextResponse.json(
                { error: "Blog post not found" },
                { status: 404 }
            );
        }

        // Only return published posts or drafts if requested by author
        if (post.status === "draft") {
            return NextResponse.json(
                { error: "Blog post not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            post,
        });
    } catch (error) {
        console.error("Fetch blog error:", error);
        return NextResponse.json(
            { error: "Failed to fetch blog post" },
            { status: 500 }
        );
    }
}