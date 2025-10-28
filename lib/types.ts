// Frontend-specific types that may include additional fields or transformations
export interface Author {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  status: string;
  createdAt: string;
  author: Author;
}

// BlogCard specific props
export interface BlogCardProps {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  tags: string[];
  coverImage: string;
  readTime: number;
}

// FeaturedBlog specific props
export interface FeaturedBlogProps {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  tags: string[];
  coverImage: string;
  readTime: number;
}

// BlogCoverImage specific props
export interface BlogCoverImageProps {
  src: string | null;
  alt: string;
  aspect?: "video" | "square" | "landscape";
  className?: string;
  priority?: boolean;
}

// BlogContent specific props
export interface BlogContentProps {
  content: string;
  className?: string;
}

// BlogMetadata specific props
export interface BlogMetadataProps {
  authorName: string | null;
  authorEmail: string;
  authorImage: string | null;
  createdAt: string;
  readTime: number;
  className?: string;
}

// BlogTags specific props
export interface BlogTagsProps {
  tags: string[];
  className?: string;
  variant?: "default" | "featured";
}

// Common state types
export interface BlogState {
  blogs: Blog[];
  loading: boolean;
  error: string | null;
}

// Common form types
export interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  coverImageFile: File | null;
  status: "draft" | "published";
}

// Validation types (can be imported from validation files if needed)
export type CreateBlogInput = {
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  status: "draft" | "published";
};

// RichTextEditor specific props
export interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}