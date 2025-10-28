"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BlogCard } from "@/components/blog-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, Share2, Loader2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import "./blog-content.css";

interface Author {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  status: string;
  createdAt: string;
  author: Author;
}

export default function BlogDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<
    Array<{ author: string; text: string }>
  >([]);
  const [newComment, setNewComment] = useState("");
  const router = useRouter();
  const { data: session } = useSession();
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
        // Fetch current blog
        const response = await fetch(`/api/blogs/${slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch blog");
        }

        setBlog(data.post);

        // Fetch all blogs for related posts
        const allBlogsResponse = await fetch("/api/blogs");
        const allBlogsData = await allBlogsResponse.json();

        if (allBlogsResponse.ok) {
          const publishedBlogs = allBlogsData.posts.filter(
            (post: Blog) =>
              post.status === "published" && post.id !== data.post.id
          );
          setRelatedBlogs(publishedBlogs.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        toast.error("Failed to load blog post");
        setTimeout(() => router.push("/"), 2000);
      } finally {
        setLoading(false);
      }
    }

    fetchBlog();
  }, [slug, router]);

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

  // Helper functions
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const textContent = content.replace(/<[^>]*>/g, "");
    const wordCount = textContent.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const extractTags = (content: string) => {
    console.log(content);
    return ["Blog"];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Toaster position="top-right" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Toaster position="top-right" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <p className="text-lg">Blog post not found</p>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
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
                <p className="font-semibold">
                  {blog.author.name || "Anonymous"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(blog.createdAt)} •{" "}
                  {calculateReadTime(blog.content)} min read
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
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Image
                src={blog.coverImage}
                alt={blog.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <style jsx global>{`
              .prose h1 {
                font-size: 2.25rem;
                font-weight: 700;
                line-height: 2.5rem;
                margin-top: 2rem;
                margin-bottom: 1rem;
              }

              .prose h2 {
                font-size: 1.875rem;
                font-weight: 700;
                line-height: 2.25rem;
                margin-top: 2rem;
                margin-bottom: 1rem;
              }

              .prose h3 {
                font-size: 1.5rem;
                font-weight: 600;
                line-height: 2rem;
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
              }

              .prose h4 {
                font-size: 1.25rem;
                font-weight: 600;
                line-height: 1.75rem;
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
              }

              .prose p {
                font-size: 1.125rem;
                line-height: 1.875rem;
                margin-bottom: 1.25rem;
                color: hsl(var(--foreground));
              }

              .prose strong {
                font-weight: 700;
                color: hsl(var(--foreground));
              }

              .prose em {
                font-style: italic;
              }

              .prose ul {
                list-style-type: disc;
                padding-left: 1.75rem;
                margin-bottom: 1.25rem;
                margin-top: 1rem;
              }

              .prose ol {
                list-style-type: decimal;
                padding-left: 1.75rem;
                margin-bottom: 1.25rem;
                margin-top: 1rem;
              }

              .prose li {
                margin-bottom: 0.5rem;
                line-height: 1.75rem;
              }

              .prose li p {
                margin-bottom: 0.5rem;
              }

              .prose a {
                color: hsl(var(--primary));
                text-decoration: underline;
                font-weight: 500;
              }

              .prose a:hover {
                color: hsl(var(--primary));
                opacity: 0.8;
              }

              .prose code {
                background-color: hsl(var(--muted));
                padding: 0.125rem 0.375rem;
                border-radius: 0.25rem;
                font-size: 0.875em;
                font-family: ui-monospace, monospace;
              }

              .prose pre {
                background-color: hsl(var(--muted));
                padding: 1rem;
                border-radius: 0.5rem;
                overflow-x: auto;
                margin-bottom: 1.25rem;
              }

              .prose pre code {
                background-color: transparent;
                padding: 0;
              }

              .prose blockquote {
                border-left: 4px solid hsl(var(--primary));
                padding-left: 1rem;
                font-style: italic;
                margin: 1.5rem 0;
                color: hsl(var(--muted-foreground));
              }

              .prose hr {
                border: none;
                border-top: 1px solid hsl(var(--border));
                margin: 2rem 0;
              }

              .prose img {
                border-radius: 0.5rem;
                margin: 1.5rem 0;
              }

              .prose table {
                width: 100%;
                border-collapse: collapse;
                margin: 1.5rem 0;
              }

              .prose th,
              .prose td {
                border: 1px solid hsl(var(--border));
                padding: 0.75rem;
                text-align: left;
              }

              .prose th {
                background-color: hsl(var(--muted));
                font-weight: 600;
              }
            `}</style>
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </div>

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
                        session
                          ? "Share your thoughts..."
                          : "Login to comment..."
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
                        <p className="font-semibold text-sm">
                          {comment.author}
                        </p>
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
      </main>

      <Footer />
    </div>
  );
}
