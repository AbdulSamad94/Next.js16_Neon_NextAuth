import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema/schema";
import { eq } from "drizzle-orm";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    const post = await db.query.posts.findFirst({
      where: eq(posts.slug, id),
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
      const session = await getServerSession(authOptions);
      if (!session || post.authorId !== session.user.id) {
        return NextResponse.json(
          { error: "Blog post not found" },
          { status: 404 }
        );
      }
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the blog post
    const blogPost = await db.query.posts.findFirst({
      where: eq(posts.slug, id),
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
    await db.delete(posts).where(eq(posts.id, id));

    return NextResponse.json(
      { success: true, message: "Blog post deleted successfully" },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (body.title.length < 5) {
      return NextResponse.json(
        { error: "Title must be at least 5 characters" },
        { status: 400 }
      );
    }

    // Find the blog post by ID (not slug)
    const blogPost = await db.query.posts.findFirst({
      where: eq(posts.slug, id),
      with: { author: true }
    });

    if (!blogPost) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Check authorization
    if (blogPost.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only edit your own blog posts" },
        { status: 403 }
      );
    }

    // Handle image upload if base64 data provided
    let coverImageUrl = body.coverImage;

    if (body.coverImageBase64 && body.coverImageType) {
      try {
        coverImageUrl = await uploadImageToCloudinary(
          body.coverImageBase64,
          body.coverImageType
        );
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    // Generate new slug if title changed
    const newSlug = body.title !== blogPost.title
      ? generateSlug(body.title)
      : blogPost.slug;

    // Update the blog post
    const updatedBlog = await db
      .update(posts)
      .set({
        title: body.title,
        slug: newSlug,
        content: body.content || "",
        excerpt: body.excerpt || null,
        coverImage: coverImageUrl || null,
        status: body.status || "published",
        updatedAt: new Date()
      })
      .where(eq(posts.slug, id))
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Blog post updated successfully",
        post: updatedBlog[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating blog post:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update blog post"
      },
      { status: 500 }
    );
  }
}