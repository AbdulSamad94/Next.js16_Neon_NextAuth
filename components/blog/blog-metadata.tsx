import { Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { BlogMetadataProps } from "@/lib/types";

export function BlogMetadata({
  authorName,
  authorEmail,
  authorImage,
  createdAt,
  readTime,
  className,
}: BlogMetadataProps) {
  const name = authorName || "Anonymous";
  const initials = authorName?.[0] || authorEmail[0] || "A";

  return (
    <div className={cn("flex items-center gap-4 text-sm text-muted-foreground", className)}>
      <div className="flex items-center gap-1">
        <User className="w-3 h-3" />
        {name}
      </div>
      <div className="flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        {formatDate(createdAt)}
      </div>
      <span className="ml-auto">{readTime} min read</span>
    </div>
  );
}