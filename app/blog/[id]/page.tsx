"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogCoverImage } from "@/components/blog/blog-cover-image";
import { BlogContent as BlogContentComponent } from "@/components/blog/blog-content";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ErrorState } from "@/components/shared/error-state";
import { motion } from "framer-motion";
import { Heart, Share2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { calculateReadTime, formatDate, extractTags } from "@/lib/utils";
import { Blog } from "@/lib/types";
import { blogApi } from "@/lib/data";
import { Suspense } from "react";
import { BlogContentSkeleton } from "@/components/blog/blog-content-skeleton";
import { BlogCardSkeleton } from "@/components/blog/blog-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

function BlogDetailContent({
  blog,
  relatedBlogs,
}: {
  blog: Blog;
  relatedBlogs: Blog[];
}) {
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<
    Array<{ author: string; text: string }>
  >([]);
  const [newComment, setNewComment] = useState("");
  const { data: session } = useSession();

  const handleAddComment = () => {
    if (!session) {
      toast.error("Please login to comment");
      return;
    }

    if (newComment.trim()) {
      setComments([
        ...comments,
        { author: session.user?.name || "You", text: newComment },
      ]);
      setNewComment("");
      toast.success("Comment added!");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title,
          text: blog?.excerpt || "",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Article Header */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Title and Meta */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {extractTags(blog.content).map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-balance">
            {blog.title}
          </h1>
          {blog.excerpt && (
            <p className="text-xl text-muted-foreground leading-relaxed">
              {blog.excerpt}
            </p>
          )}
        </div>

        {/* Author Info */}
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={blog.author.image || "/placeholder.svg"} />
              <AvatarFallback>
                {blog.author.name?.[0] || blog.author.email[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{blog.author.name || "Anonymous"}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(blog.createdAt)} • {calculateReadTime(blog.content)}{" "}
                min read
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLiked(!liked)}
              className={liked ? "text-red-500" : ""}
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Cover Image */}
        {blog.coverImage && (
          <BlogCoverImage
            src={blog.coverImage}
            alt={blog.title}
            aspect="video"
          />
        )}

        {/* Content */}
        <BlogContentComponent content={blog.content} />

        {/* Comments Section */}
        <div className="border-t border-border pt-12 space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Comments ({comments.length})
            </h2>

            {/* Add Comment */}
            <div className="mb-8 space-y-4">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback>
                    {session?.user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder={
                      session ? "Share your thoughts..." : "Login to comment..."
                    }
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="resize-none"
                    disabled={!session}
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || !session}
                  >
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            {comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map((comment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-4"
                  >
                    <Avatar>
                      <AvatarFallback>{comment.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{comment.author}</p>
                      <p className="text-muted-foreground mt-1">
                        {comment.text}
                      </p>
                      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                        <button className="hover:text-foreground transition">
                          Like
                        </button>
                        <button className="hover:text-foreground transition">
                          Reply
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </div>
      </motion.article>

      {/* Related Posts */}
      {relatedBlogs.length > 0 && (
        <section className="mt-20 pt-12 border-t border-border">
          <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedBlogs.map((relatedBlog, index) => (
              <motion.div
                key={relatedBlog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <BlogCard
                  id={relatedBlog.slug}
                  title={relatedBlog.title}
                  excerpt={
                    relatedBlog.excerpt ||
                    relatedBlog.content
                      .replace(/<[^>]*>/g, "")
                      .substring(0, 150) + "..."
                  }
                  author={relatedBlog.author.name || "Anonymous"}
                  date={formatDate(relatedBlog.createdAt)}
                  tags={extractTags(relatedBlog.content)}
                  coverImage={
                    relatedBlog.coverImage ||
                    "/placeholder.svg?height=400&width=600"
                  }
                  readTime={calculateReadTime(relatedBlog.content)}
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}

export default function BlogDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    async function unwrapParams() {
      const resolvedParams = await params;
      setSlug(resolvedParams.id);
    }
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    async function fetchBlog() {
      try {
        // Fetch current blog using centralized API service
        const blogResponse = await blogApi.getBlogById(slug);
        setBlog(blogResponse.post);

        // Fetch all blogs for related posts using centralized API service
        const allBlogsResponse = await blogApi.getAllBlogs();
        const publishedBlogs = allBlogsResponse.posts.filter(
          (post: Blog) =>
            post.status === "published" && post.id !== blogResponse.post.id
        );
        setRelatedBlogs(publishedBlogs.slice(0, 3));
      } catch (error) {
        console.error("Error fetching blog:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load blog post"
        );
      }
    }

    fetchBlog();
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Toaster position="top-right" />
        <ErrorState
          message="Blog post not found"
          showBackButton={true}
          className="min-h-[60vh]"
        />
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Toaster position="top-right" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Link href="/" className="inline-block mb-6">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>

          {/* Skeleton for blog content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <Skeleton className="h-8 md:h-10 w-4/5" />
              <Skeleton className="h-5 w-2/3" />
            </div>

            <div className="flex items-center justify-between border-b border-border pb-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32 mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>

            <Skeleton className="aspect-video w-full rounded-xl" />

            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-40 w-full mt-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Toaster position="top-right" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href="/" className="inline-block mb-6">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>

        {/* Async Content with Skeletons */}
        <Suspense
          fallback={
            <div className="space-y-8">
              <BlogContentSkeleton />
              <section className="mt-20 pt-12 border-t border-border">
                <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[...Array(3)].map((_, index) => (
                    <BlogCardSkeleton key={index} />
                  ))}
                </div>
              </section>
            </div>
          }
        >
          <BlogDetailContent blog={blog} relatedBlogs={relatedBlogs} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
