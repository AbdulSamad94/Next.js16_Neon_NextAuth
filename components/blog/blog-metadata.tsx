import Link from "next/link";
import { Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { BlogMetadataProps } from "@/lib/types";

export function BlogMetadata({
  authorName,
  authorId,
  createdAt,
  readTime,
  className,
}: BlogMetadataProps) {
  const name = authorName || "Anonymous";

  return (
    <div
      className={cn(
        "flex items-center gap-4 text-sm text-muted-foreground",
        className
      )}
    >
      <Link
        href={`/profile/${authorId}`}
        className="flex items-center gap-1 hover:text-primary transition-colors"
      >
        <User className="w-3 h-3" />
        {name}
      </Link>
      <div className="flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        {formatDate(createdAt)}
      </div>
      <span className="ml-auto">{readTime} min read</span>
    </div>
  );
}
