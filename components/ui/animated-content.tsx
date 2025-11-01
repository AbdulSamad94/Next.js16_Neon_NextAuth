"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedContentProps {
  children: React.ReactNode;
  isLoading: boolean;
  delay?: number;
}

export function AnimatedContent({ 
  children, 
  isLoading, 
  delay = 0 
}: AnimatedContentProps) {
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!isLoading && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [isLoading, hasLoaded]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={hasLoaded ? "content" : "skeleton"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: 0.5,
          ease: "easeInOut"
        }}
        style={{ height: "100%" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}