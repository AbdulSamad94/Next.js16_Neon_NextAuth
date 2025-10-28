"use client";

import Link from "next/link";
import { BlogCoverImage } from "@/components/blog/blog-cover-image";
import { BlogTags } from "@/components/blog/blog-tags";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { FeaturedBlogProps } from "@/lib/types";

export function FeaturedBlog({
  id,
  title,
  excerpt,
  author,
  date,
  tags,
  coverImage,
  readTime,
}: FeaturedBlogProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/blog/${id}`}>
        <article className="group cursor-pointer grid md:grid-cols-2 gap-8 items-center mb-16">
          <BlogCoverImage
            src={coverImage || "/placeholder.svg"}
            alt={title}
            aspect="video"
            className="md:h-96"
          />
          <div className="space-y-6">
            <div className="space-y-2">
              <BlogTags tags={tags} variant="featured" />
              <h2 className="text-3xl md:text-4xl font-bold leading-tight group-hover:text-primary transition">
                {title}
              </h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {excerpt}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{author}</span>
              <span>•</span>
              <span>{date}</span>
              <span>•</span>
              <span>{readTime} min read</span>
            </div>
            <Button className="gap-2 group/btn">
              Read Article
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}