import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { users, posts, follows } from "@/lib/db/schema/schema";
import { eq, and, desc } from "drizzle-orm";

// GET /api/users/[id] - Fetch user profile with posts
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }

) {
    try {
        const userId = (await params).id;
        const session = await getServerSession(authOptions);
        const currentUserId = session?.user?.id;

        // Fetch user with basic info
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: {
                id: true,
                name: true,
                email: true,
                image: true,
                bio: true,
                followerCount: true,
                followingCount: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if current user follows this user
        let isFollowing = false;
        if (currentUserId && currentUserId !== userId) {
            const followRecord = await db.query.follows.findFirst({
                where: and(
                    eq(follows.followerId, currentUserId),
                    eq(follows.followingId, userId)
                ),
            });
            isFollowing = !!followRecord;
        }

        // Determine if viewing own profile
        const isOwnProfile = currentUserId === userId;

        // Fetch posts (drafts + published for self, published only for others)
        const userPosts = await db.query.posts.findMany({
            where: isOwnProfile
                ? eq(posts.authorId, userId)
                : and(eq(posts.authorId, userId), eq(posts.status, "published")),
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
            orderBy: [desc(posts.createdAt)],
        });

        return NextResponse.json({
            success: true,
            user: {
                ...user,
                isFollowing,
                isOwnProfile,
                posts: userPosts,
            },
        });
    } catch (error) {
        console.error("Fetch user profile error:", error);
        return NextResponse.json(
            { error: "Failed to fetch user profile" },
            { status: 500 }
        );
    }
}

// PUT /api/users/[id] - Update user profile
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const userId = (await params).id;

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only allow updating own profile
        if (session.user.id !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { name, bio } = body;

        // Validation
        if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
            return NextResponse.json(
                { error: "Name must be a non-empty string" },
                { status: 400 }
            );
        }

        if (bio !== undefined && typeof bio !== "string") {
            return NextResponse.json({ error: "Bio must be a string" }, { status: 400 });
        }

        const updateData: { name?: string; bio?: string } = {};
        if (name !== undefined) updateData.name = name.trim();
        if (bio !== undefined) updateData.bio = bio.trim();

        // Update user profile
        const [updatedUser] = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, userId))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                image: users.image,
                bio: users.bio,
                followerCount: users.followerCount,
                followingCount: users.followingCount,
                createdAt: users.createdAt,
            });

        // Fetch updated posts
        const userPosts = await db.query.posts.findMany({
            where: eq(posts.authorId, userId),
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
            orderBy: [desc(posts.createdAt)],
        });

        return NextResponse.json({
            success: true,
            user: {
                ...updatedUser,
                posts: userPosts,
            },
        });
    } catch (error) {
        console.error("Update user profile error:", error);
        return NextResponse.json(
            { error: "Failed to update user profile" },
            { status: 500 }
        );
    }
}
