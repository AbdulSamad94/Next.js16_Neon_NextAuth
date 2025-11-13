"use client";

import { motion } from "framer-motion";
import { BlogCard } from "@/components/blog/blog-card";
import { calculateReadTime, formatDate } from "@/lib/utils";
import { Blog } from "@/lib/types";

interface BlogGridProps {
  blogs: Blog[];
}

export function BlogGrid({ blogs }: BlogGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {blogs.map((blog, index) => (
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
              blog.content.replace(/<[^>]*>/g, "").substring(0, 150) + "..."
            }
            author={blog.author.name || "Anonymous"}
            authorId={blog.author.id}
            date={formatDate(blog.createdAt)}
            tags={blog.postCategories?.map((pc) => pc.category.name) || []}
            coverImage={
              blog.coverImage || "/placeholder.svg?height=400&width=600"
            }
            readTime={calculateReadTime(blog.content)}
          />
        </motion.div>
      ))}
    </div>
  );
}
