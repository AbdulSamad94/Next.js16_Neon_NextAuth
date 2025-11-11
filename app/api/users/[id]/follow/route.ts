import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/authOptions";
import { db } from "@/lib/db";
import { users, follows } from "@/lib/db/schema/schema";
import { eq, and, sql } from "drizzle-orm";

// POST /api/users/[id]/follow - Follow a user
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getAuthSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: targetUserId } = await params;
        const currentUserId = session.user.id;

        // Can't follow yourself
        if (currentUserId === targetUserId) {
            return NextResponse.json(
                { error: "Cannot follow yourself" },
                { status: 400 }
            );
        }

        // Check if target user exists
        const targetUser = await db.query.users.findFirst({
            where: eq(users.id, targetUserId),
        });

        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if already following
        const existingFollow = await db.query.follows.findFirst({
            where: and(
                eq(follows.followerId, currentUserId),
                eq(follows.followingId, targetUserId)
            ),
        });

        if (existingFollow) {
            return NextResponse.json(
                { error: "Already following this user" },
                { status: 400 }
            );
        }

        // Create follow relationship
        await db.insert(follows).values({
            followerId: currentUserId,
            followingId: targetUserId,
            createdAt: new Date(),
        });

        // Update follower count for target user - FIX: Use raw SQL properly
        await db.execute(
            sql`UPDATE ${users} SET follower_count = follower_count + 1 WHERE ${users.id} = ${targetUserId}`
        );

        // Update following count for current user - FIX: Use raw SQL properly
        await db.execute(
            sql`UPDATE ${users} SET following_count = following_count + 1 WHERE ${users.id} = ${currentUserId}`
        );

        // Get updated follower count
        const updatedTargetUser = await db.query.users.findFirst({
            where: eq(users.id, targetUserId),
            columns: { followerCount: true },
        });

        return NextResponse.json({
            success: true,
            isFollowing: true,
            followerCount: updatedTargetUser?.followerCount || 0,
        });
    } catch (error) {
        console.error("Follow user error:", error);

        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }

        return NextResponse.json(
            { error: "Failed to follow user" },
            { status: 500 }
        );
    }
}

// DELETE /api/users/[id]/follow - Unfollow a user
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getAuthSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: targetUserId } = await params;
        const currentUserId = session.user.id;

        // Check if following relationship exists
        const existingFollow = await db.query.follows.findFirst({
            where: and(
                eq(follows.followerId, currentUserId),
                eq(follows.followingId, targetUserId)
            ),
        });

        if (!existingFollow) {
            return NextResponse.json(
                { error: "Not following this user" },
                { status: 400 }
            );
        }

        // Delete follow relationship
        await db
            .delete(follows)
            .where(
                and(
                    eq(follows.followerId, currentUserId),
                    eq(follows.followingId, targetUserId)
                )
            );

        // Update follower count for target user - FIX: Use raw SQL properly
        await db.execute(
            sql`UPDATE ${users} SET follower_count = GREATEST(follower_count - 1, 0) WHERE ${users.id} = ${targetUserId}`
        );

        // Update following count for current user - FIX: Use raw SQL properly
        await db.execute(
            sql`UPDATE ${users} SET following_count = GREATEST(following_count - 1, 0) WHERE ${users.id} = ${currentUserId}`
        );

        // Get updated follower count
        const updatedTargetUser = await db.query.users.findFirst({
            where: eq(users.id, targetUserId),
            columns: { followerCount: true },
        });

        return NextResponse.json({
            success: true,
            isFollowing: false,
            followerCount: updatedTargetUser?.followerCount || 0,
        });
    } catch (error) {
        console.error("Unfollow user error:", error);

        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }

        return NextResponse.json(
            { error: "Failed to unfollow user" },
            { status: 500 }
        );
    }
}