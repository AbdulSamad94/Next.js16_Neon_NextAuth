"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface FeaturedBlogProps {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  tags: string[];
  coverImage: string;
  readTime: number;
}

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
          <div className="relative aspect-video md:aspect-auto md:h-96 overflow-hidden rounded-xl">
            <Image
              src={coverImage || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
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
