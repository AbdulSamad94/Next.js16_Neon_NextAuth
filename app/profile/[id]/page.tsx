"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BlogCard } from "@/components/blog/blog-card";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar, Edit, UserCheck, UserPlus } from "lucide-react";
import { calculateReadTime, formatDate } from "@/lib/utils";
import { userApi } from "@/lib/data";
import { UserProfileWithPosts } from "@/lib/types";
import toast from "react-hot-toast";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [profile, setProfile] = useState<UserProfileWithPosts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);

  // Handle async params
  useEffect(() => {
    async function resolveParams() {
      try {
        const resolved = await params;
        setUserId(resolved.id);
      } catch (err) {
        console.error("Failed to resolve params:", err);
        setError("Invalid user ID");
      }
    }
    resolveParams();
  }, [params]);

  // Fetch user profile when userId is available
  useEffect(() => {
    if (!userId) return;

    async function fetchProfile() {
      try {
        setLoading(true);
        const userData = await userApi.getUserById(userId as string);
        setProfile(userData);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!session?.user) {
      toast.error("Please sign in to follow users");
      return;
    }
    if (!profile || !userId) return;

    try {
      setFollowLoading(true);
      const result = profile.isFollowing
        ? await userApi.unfollowUser(userId)
        : await userApi.followUser(userId);

      setProfile({
        ...profile,
        isFollowing: result.isFollowing,
        followerCount: result.followerCount,
      });

      toast.success(
        result.isFollowing
          ? `Now following ${profile.name || "this user"}`
          : `Unfollowed ${profile.name || "this user"}`
      );
    } catch (err) {
      console.error("Error toggling follow:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update follow status"
      );
    } finally {
      setFollowLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <ErrorState
          message="Failed to load profile"
          error={error}
          showBackButton
          className="min-h-[60vh]"
        />
        <Footer />
      </div>
    );
  }

  if (loading || !userId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ProfileSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <ErrorState
          message="User not found"
          error="This profile does not exist"
          showBackButton
          className="min-h-[60vh]"
        />
        <Footer />
      </div>
    );
  }

  const isOwnProfile = session?.user?.id === userId;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.image || "/default-profile.jpeg"} />
                <AvatarFallback className="text-2xl">
                  {profile.name?.[0] || profile.email[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-1">
                      {profile.name || "Anonymous"}
                    </h1>
                    <p className="text-muted-foreground">{profile.email}</p>
                  </div>

                  <div className="flex gap-2">
                    {isOwnProfile ? (
                      <Button
                        onClick={() => router.push(`/profile/${userId}/edit`)}
                        variant="outline"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <Button
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        variant={profile.isFollowing ? "outline" : "default"}
                      >
                        {profile.isFollowing ? (
                          <>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Follow
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">{profile.bio}</p>

                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <span className="font-semibold">
                      {profile.followerCount}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {profile.followerCount === 1 ? "Follower" : "Followers"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">
                      {profile.followingCount}
                    </span>{" "}
                    <span className="text-muted-foreground">Following</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Joined {formatDate(profile.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* User's Posts */}
        <section>
          <h2 className="text-2xl font-bold mb-8">
            {isOwnProfile
              ? "Your Posts"
              : `Posts by ${profile.name || "this user"}`}
            <span className="text-muted-foreground ml-2">
              ({profile.posts.length})
            </span>
          </h2>

          {profile.posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {isOwnProfile
                  ? "You haven't written any posts yet"
                  : "This user hasn't published any posts yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {profile.posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <BlogCard
                    id={post.slug}
                    title={post.title}
                    excerpt={
                      post.excerpt ||
                      post.content.replace(/<[^>]*>/g, "").substring(0, 150) +
                        "..."
                    }
                    author={post.author.name || "Anonymous"}
                    authorId={post.author.id}
                    date={formatDate(post.createdAt)}
                    tags={
                      post.postCategories?.map((pc) => pc.category.name) || []
                    }
                    coverImage={
                      post.coverImage || "/placeholder.svg?height=400&width=600"
                    }
                    readTime={calculateReadTime(post.content)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <>
      <div className="bg-card border border-border rounded-lg p-8 mb-12">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-16 w-full" />
            <div className="flex gap-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
