"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FeaturedBlog } from "@/components/featured-blog";
import { BlogCard } from "@/components/blog-card";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const response = await fetch("/api/blogs");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch blogs");
        }

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

  // Helper function to calculate read time
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const textContent = content.replace(/<[^>]*>/g, ""); // Strip HTML
    const wordCount = textContent.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Helper function to extract tags (you can modify this based on your needs)
  const extractTags = (content: string) => {
    console.log(content);
    return ["Blog"];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <p className="text-destructive text-lg">Error loading blogs</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
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
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold mb-4">No blogs yet</h3>
            <p className="text-muted-foreground">
              Be the first to share your story!
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
