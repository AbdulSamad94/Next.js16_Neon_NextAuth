import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { posts, users } from "@/lib/db/schema/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the blog post
    const blogPost = await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
      with: {
        author: true
      }
    });

    if (!blogPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Check if the current user is the author of the blog
    if (blogPost.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own blog posts" },
        { status: 403 }
      );
    }

    // Delete the blog post
    await db.delete(posts).where(eq(posts.slug, slug));

    return NextResponse.json(
      { message: "Blog post deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting blog post:", error);

    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Find the blog post
    const blogPost = await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
      with: {
        author: true
      }
    });

    if (!blogPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Check if the current user is the author of the blog
    if (blogPost.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only edit your own blog posts" },
        { status: 403 }
      );
    }

    // Update the blog post with all fields from schema
    const updatedBlog = await db
      .update(posts)
      .set({
        title: body.title,
        content: body.content,
        excerpt: body.excerpt,
        coverImage: body.coverImage,
        status: body.status,
        updatedAt: new Date()
      })
      .where(eq(posts.slug, slug))
      .returning();

    return NextResponse.json(
      {
        message: "Blog post updated successfully",
        post: updatedBlog[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating blog post:", error);

    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}