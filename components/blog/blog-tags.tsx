import { BlogTagsProps } from "@/lib/types";

export function BlogTags({ tags, className = "", variant = "default" }: BlogTagsProps) {
  const baseClass = "text-xs px-3 py-1 rounded-full font-medium";
  const variantClass = variant === "featured" 
    ? "bg-primary/10 text-primary" 
    : "bg-accent text-accent-foreground";
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <span
          key={tag}
          className={`${baseClass} ${variantClass}`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}