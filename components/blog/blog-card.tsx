"use client";

import Link from "next/link";
import Image from "next/image";
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
  date,
  tags,
  coverImage,
  readTime,
}: BlogCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link href={`/blog/${id}`}>
        <article className="group cursor-pointer h-full flex flex-col">
          <div className="overflow-hidden rounded-lg bg-secondary mb-4 aspect-video relative flex-shrink-0">
            <Image
              src={coverImage || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex-grow space-y-3">
            <BlogTags tags={tags} />
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {excerpt}
            </p>
            <BlogMetadata
              authorName={author}
              authorEmail={author} // Using author name as email for this component
              authorImage={null}
              createdAt={date}
              readTime={readTime}
            />
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
