"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { Blog } from "@/lib/types";
import { blogApi } from "@/lib/data";
import { Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { BlogContentSkeleton } from "@/components/blog/blog-content-skeleton";
import { BlogCardSkeleton } from "@/components/blog/blog-card-skeleton";
import { BlogContentSection } from "@/components/blog/detail/blog-content-section";
import { BlogComments } from "@/components/blog/detail/blog-comments";
import { RelatedPosts } from "@/components/blog/detail/related-posts";
import { BlogDetailSkeleton } from "@/components/blog/detail/blog-detail-skeleton";

export default function BlogDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [error, setError] = useState<string | null>(null);
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
          <BlogDetailSkeleton />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <ProtectedRoute>
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <BlogContentSection session={session} blog={blog} blogId={slug} />
              <BlogComments blogId={slug} session={session} />
              <RelatedPosts relatedBlogs={relatedBlogs} />
            </motion.div>
          </Suspense>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
