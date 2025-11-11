"use client";

import Link from "next/link";
import { BlogMetadata } from "@/components/blog/blog-metadata";
import { BlogCoverImage } from "@/components/blog/blog-cover-image";
import { BlogTags } from "@/components/blog/blog-tags";
import { motion } from "framer-motion";
import { BlogCardProps } from "@/lib/types";

export function BlogCard({
  id,
  title,
  excerpt,
  author,
  authorId,
  date,
  tags,
  coverImage,
  readTime,
}: BlogCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <article className="group h-full flex flex-col">
        <Link href={`/blog/${id}`}>
          <div className="overflow-hidden rounded-lg bg-secondary mb-4 aspect-video relative shrink-0">
            <BlogCoverImage
              src={coverImage || "/placeholder.svg"}
              alt={title}
              aspect="video"
              className="group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
        <div className="grow space-y-3">
          <BlogTags tags={tags} />
          <Link href={`/blog/${id}`}>
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition cursor-pointer">
              {title}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {excerpt}
          </p>
          <BlogMetadata
            authorName={author}
            authorEmail={author}
            authorImage={null}
            authorId={authorId}
            createdAt={date}
            readTime={readTime}
          />
        </div>
      </article>
    </motion.div>
  );
}
