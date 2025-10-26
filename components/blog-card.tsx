"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, User } from "lucide-react";

interface BlogCardProps {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  tags: string[];
  coverImage: string;
  readTime: number;
}

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
        <article className="group cursor-pointer h-full">
          <div className="overflow-hidden rounded-lg bg-secondary mb-4 aspect-video relative">
            <Image
              src={coverImage || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {excerpt}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {date}
                </div>
              </div>
              <span>{readTime} min read</span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
