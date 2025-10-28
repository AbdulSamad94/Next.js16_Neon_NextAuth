import { cn } from "@/lib/utils";
import "../blog-content.css";
import { BlogContentProps } from "@/lib/types";

export function BlogContent({ content, className }: BlogContentProps) {
  return (
    <div className={cn("blog-content", className)}>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}