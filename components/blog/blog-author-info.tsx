import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface BlogAuthorInfoProps {
  authorName: string | null;
  authorEmail: string;
  authorImage: string | null;
  createdAt: string;
  readTime: number;
  variant?: "default" | "large";
}

export function BlogAuthorInfo({
  authorName,
  authorEmail,
  authorImage,
  createdAt,
  readTime,
  variant = "default",
}: BlogAuthorInfoProps) {
  const name = authorName || "Anonymous";
  const initials = authorName?.[0] || authorEmail[0] || "A";
  
  const containerClass = variant === "large" 
    ? "flex items-center justify-between border-b border-border pb-6"
    : "flex items-center gap-4 text-sm text-muted-foreground";
  
  const authorClass = variant === "large" 
    ? "flex items-center gap-4"
    : "flex items-center gap-1";

  return (
    <div className={containerClass}>
      <div className={authorClass}>
        <Avatar className={variant === "large" ? "" : "w-5 h-5"}>
          <AvatarImage src={authorImage || "/placeholder.svg"} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2">
          <span className={variant === "large" ? "font-semibold" : ""}>
            {name}
          </span>
          {variant === "large" && (
            <>
              <span>•</span>
              <span>{formatDate(createdAt)}</span>
              <span>•</span>
              <span>{readTime} min read</span>
            </>
          )}
        </div>
      </div>
      {variant === "default" && (
        <div className="flex items-center gap-4 ml-4">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {name}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(createdAt)}
          </div>
        </div>
      )}
      {variant === "default" && (
        <span className="ml-auto">{readTime} min read</span>
      )}
    </div>
  );
}