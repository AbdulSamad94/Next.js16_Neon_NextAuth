"use client";

import { motion } from "framer-motion";
import { BlogCard } from "@/components/blog/blog-card";
import { Blog } from "@/lib/types";
import { extractTags, calculateReadTime, formatDate } from "@/lib/utils";

interface RelatedPostsProps {
  relatedBlogs: Blog[];
}

export function RelatedPosts({ relatedBlogs }: RelatedPostsProps) {
  if (relatedBlogs.length === 0) {
    return null;
  }

  return (
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
              authorId={relatedBlog.author.id}
              title={relatedBlog.title}
              excerpt={
                relatedBlog.excerpt ||
                relatedBlog.content.replace(/<[^>]*>/g, "").substring(0, 150) +
                  "..."
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
  );
}
