import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function FeaturedBlogSkeleton() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <article className="group cursor-pointer grid md:grid-cols-2 gap-8 items-center mb-16">
        <div className="aspect-video rounded-xl overflow-hidden relative">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <Skeleton className="h-8 md:h-10 w-4/5" />
          </div>
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
          <div className="flex items-center gap-4 text-sm">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
      </article>
    </motion.div>
  );
}