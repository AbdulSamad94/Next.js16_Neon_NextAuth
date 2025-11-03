"use client";

import { motion } from "framer-motion";
import { Blog } from "@/lib/types";
import { BlogContent as BlogContentComponent } from "@/components/blog/blog-content";
import { BlogCoverImage } from "@/components/blog/blog-cover-image";
import { extractTags } from "@/lib/utils";
import { BlogHeader } from "./blog-header";
import { Session } from "next-auth";

interface BlogContentSectionProps {
  blog: Blog;
  blogId: string;
  session: Session | null;
}

export function BlogContentSection({
  blog,
  session,
  blogId,
}: BlogContentSectionProps) {
  return (
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

      {/* Author Info and Actions */}

      <BlogHeader blogId={blogId} blog={blog} session={session} />

      {/* Cover Image */}
      {blog.coverImage && (
        <BlogCoverImage src={blog.coverImage} alt={blog.title} aspect="video" />
      )}

      {/* Content */}
      <BlogContentComponent content={blog.content} />
    </motion.article>
  );
}
