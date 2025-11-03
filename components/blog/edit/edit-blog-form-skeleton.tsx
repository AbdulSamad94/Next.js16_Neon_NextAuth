import { Skeleton } from "@/components/ui/skeleton";

export function EditBlogFormSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
        <Skeleton className="h-8 w-8 mx-auto" />
        <Skeleton className="h-5 w-40 mt-2" />
        <Skeleton className="h-4 w-48 mt-1" />
      </div>

      <div>
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-12 w-full" />
      </div>

      <div>
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-20 w-full" />
      </div>

      <div>
        <Skeleton className="h-4 w-12 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>

      <div>
        <Skeleton className="h-4 w-20 mb-2" />
        <div className="border border-border rounded-lg overflow-hidden">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-6">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
