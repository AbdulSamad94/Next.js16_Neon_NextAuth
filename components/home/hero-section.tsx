"use client";

import { motion } from "framer-motion";

export function HeroSection() {
  return (
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
          Explore insightful articles on web development, design, and technology
          from our community of writers.
        </p>
      </div>
    </motion.section>
  );
}
