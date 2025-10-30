import Image from "next/image";
import { cn } from "@/lib/utils";

import { BlogCoverImageProps } from "@/lib/types";

export function BlogCoverImage({ 
  src, 
  alt, 
  aspect = "video", 
  className,
  priority = false 
}: BlogCoverImageProps) {
  const aspectClasses = {
    video: "aspect-video",
    square: "aspect-square",
    landscape: "aspect-[4/3]",
  };

  if (!src) {
    return null;
  }

  return (
    <div className={cn(`${aspectClasses[aspect]} rounded-xl overflow-hidden relative`, className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
