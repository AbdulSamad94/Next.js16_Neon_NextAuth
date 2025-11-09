import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function BlogCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      data-testid="blog-skeleton"
    >
      <div className="group cursor-pointer h-full flex flex-col">
        <div className="overflow-hidden rounded-lg bg-secondary mb-4 aspect-video relative shrink-0">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="grow space-y-3 p-4">
          <div className="flex gap-2">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="ml-auto">
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
