"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FeaturedBlog } from "@/components/blog/featured-blog";
import { BlogCard } from "@/components/blog/blog-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Loader } from "@/components/shared/loader";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { calculateReadTime, formatDate, extractTags } from "@/lib/utils";
import { Blog } from "@/lib/types";
import { blogApi } from "@/lib/data";

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        // Fetch blogs using centralized API service
        const data = await blogApi.getAllBlogs();

        // Filter only published blogs
        const publishedBlogs = data.posts.filter(
          (post: Blog) => post.status === "published"
        );
        setBlogs(publishedBlogs);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError(err instanceof Error ? err.message : "Failed to load blogs");
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <ErrorState
          message="Failed to load blogs"
          error={error}
          showBackButton={true}
          className="min-h-[60vh]"
        />
        <Footer />
      </div>
    );
  }

  const featuredBlog = blogs[0]; // First blog as featured
  const otherBlogs = blogs.slice(1); // Rest of the blogs

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-balance">
              Discover Stories Worth Reading
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl text-balance">
              Explore insightful articles on web development, design, and
              technology from our community of writers.
            </p>
          </div>
        </motion.section>

        {/* Featured Blog */}
        {featuredBlog && (
          <section className="mb-20">
            <FeaturedBlog
              id={featuredBlog.slug}
              title={featuredBlog.title}
              excerpt={
                featuredBlog.excerpt ||
                featuredBlog.content.replace(/<[^>]*>/g, "").substring(0, 200) +
                  "..."
              }
              author={featuredBlog.author.name || "Anonymous"}
              date={formatDate(featuredBlog.createdAt)}
              tags={extractTags(featuredBlog.content)}
              coverImage={
                featuredBlog.coverImage ||
                "/placeholder.svg?height=400&width=800"
              }
              readTime={calculateReadTime(featuredBlog.content)}
            />
          </section>
        )}

        {/* Blog Grid */}
        {otherBlogs.length > 0 && (
          <section>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-8">Latest Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherBlogs.map((blog, index) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <BlogCard
                      id={blog.slug}
                      title={blog.title}
                      excerpt={
                        blog.excerpt ||
                        blog.content.replace(/<[^>]*>/g, "").substring(0, 150) +
                          "..."
                      }
                      author={blog.author.name || "Anonymous"}
                      date={formatDate(blog.createdAt)}
                      tags={extractTags(blog.content)}
                      coverImage={
                        blog.coverImage ||
                        "/placeholder.svg?height=400&width=600"
                      }
                      readTime={calculateReadTime(blog.content)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* Empty State */}
        {blogs.length === 0 && (
          <EmptyState
            title="No blogs yet"
            description="Be the first to share your story!"
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
