"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FeaturedBlog } from "@/components/featured-blog";
import { BlogCard } from "@/components/blog-card";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

const featuredBlog = {
  id: "1",
  title: "The Future of Web Development: Trends to Watch in 2025",
  excerpt:
    "Explore the emerging technologies and practices that will shape web development in the coming year.",
  author: "Sarah Chen",
  date: "Oct 24, 2025",
  tags: ["Web Dev", "Trends", "Technology"],
  coverImage: "/modern-web-dev-workspace.png",
  readTime: 8,
};

const blogs = [
  {
    id: "2",
    title: "Mastering React Server Components",
    excerpt:
      "A deep dive into React Server Components and how they can improve your application performance.",
    author: "Alex Johnson",
    date: "Oct 22, 2025",
    tags: ["React", "Performance"],
    coverImage: "/react-code-editor.jpg",
    readTime: 6,
  },
  {
    id: "3",
    title: "Building Scalable APIs with Next.js",
    excerpt:
      "Learn best practices for building robust and scalable APIs using Next.js route handlers.",
    author: "Emma Davis",
    date: "Oct 20, 2025",
    tags: ["Next.js", "API", "Backend"],
    coverImage: "/api-architecture-diagram.jpg",
    readTime: 7,
  },
  {
    id: "4",
    title: "CSS Grid vs Flexbox: When to Use Each",
    excerpt:
      "Understanding the differences and best use cases for CSS Grid and Flexbox in modern layouts.",
    author: "Michael Park",
    date: "Oct 18, 2025",
    tags: ["CSS", "Layout", "Design"],
    coverImage: "/css-layout-design.jpg",
    readTime: 5,
  },
  {
    id: "5",
    title: "TypeScript Tips for Better Code Quality",
    excerpt:
      "Practical TypeScript patterns and techniques to write more maintainable and type-safe code.",
    author: "Lisa Wong",
    date: "Oct 16, 2025",
    tags: ["TypeScript", "Best Practices"],
    coverImage: "/typescript-code.png",
    readTime: 6,
  },
  {
    id: "6",
    title: "Optimizing Web Performance: A Complete Guide",
    excerpt:
      "Comprehensive strategies for improving your website performance and user experience.",
    author: "James Miller",
    date: "Oct 14, 2025",
    tags: ["Performance", "Optimization"],
    coverImage: "/performance-metrics-dashboard.png",
    readTime: 9,
  },
  {
    id: "7",
    title: "Getting Started with Tailwind CSS",
    excerpt:
      "An introduction to utility-first CSS and how Tailwind CSS can speed up your development.",
    author: "Nina Patel",
    date: "Oct 12, 2025",
    tags: ["CSS", "Tailwind", "Tutorial"],
    coverImage: "/tailwind-css-design.png",
    readTime: 5,
  },
];

export default function Home() {
  const { data: session } = useSession();
  console.log(session?.user?.email);
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
        <section className="mb-20">
          <FeaturedBlog {...featuredBlog} />
        </section>

        {/* Blog Grid */}
        <section>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-8">Latest Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <BlogCard {...blog} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
