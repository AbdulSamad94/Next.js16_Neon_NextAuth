"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Upload, Eye, EyeOff, X } from "lucide-react";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Suspense } from "react";
import { blogApi } from "@/lib/data";
import { extractTags } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import toast from "react-hot-toast";

// Component for the blog editing form
function EditBlogContent({ blogId }: { blogId: string }) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [tags, setTags] = useState("");
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlog() {
      try {
        // Fetch blog by ID using centralized API service
        const response = await blogApi.getBlogById(blogId);
        const blog = response.post;
        setTitle(blog.title);
        setExcerpt(blog.excerpt || "");
        setContent(blog.content);
        setCoverImage(blog.coverImage);
        setTags(extractTags(blog.content).join(", "));
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError(err instanceof Error ? err.message : "Failed to load blog");
      } finally {
        setLoading(false);
      }
    }

    if (blogId) {
      fetchBlog();
    }
  }, [blogId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, WebP, or GIF)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Create local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result as string);
      setCoverImageFile(file);
    };
    reader.readAsDataURL(file);
    toast.success("Image selected! It will upload when you save.");
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImageFile(null);
    toast.success("Cover image removed");
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    try {
      setLoading(true);
      // Prepare payload
      type BlogPayload = {
        title: string;
        excerpt?: string;
        content: string;
        coverImage?: string | null;
        status?: "draft" | "published";
        coverImageBase64?: string;
        coverImageType?: string;
      };

      const updateBlogWithImage = async (imageBase64?: string) => {
        const payload: BlogPayload = {
          title,
          excerpt: excerpt || undefined,
          content,
          coverImage: coverImage || null,
        };

        if (imageBase64 && coverImageFile) {
          payload.coverImageBase64 = imageBase64;
          payload.coverImageType = coverImageFile.type;
        }

        // Update blog using centralized API service
        await blogApi.updateBlog(blogId, payload);
        alert("Blog updated successfully!");
        window.location.href = `/blog/${blogId}`;
      };

      // Add base64 image if exists
      if (coverImage && coverImageFile) {
        // Convert image to base64 if it's a file
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          updateBlogWithImage(base64Data);
        };
        reader.readAsDataURL(coverImageFile);
      } else {
        // Update blog using centralized API service without image
        await updateBlogWithImage();
      }

      alert("Blog updated successfully!");
      window.location.href = `/blog/${blogId}`;
    } catch (err) {
      console.error("Error updating blog:", err);
      alert(err instanceof Error ? err.message : "Failed to update blog");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    try {
      setLoading(true);
      // Prepare payload
      type BlogPayload = {
        title: string;
        excerpt?: string;
        content: string;
        coverImage?: string | null;
        status?: "draft" | "published";
        coverImageBase64?: string;
        coverImageType?: string;
      };

      const updateBlogWithImage = async (imageBase64?: string) => {
        const payload: BlogPayload = {
          title,
          excerpt: excerpt || undefined,
          content,
          coverImage: coverImage || null,
          status: "draft",
        };

        if (imageBase64 && coverImageFile) {
          payload.coverImageBase64 = imageBase64;
          payload.coverImageType = coverImageFile.type;
        }

        // Update blog using centralized API service
        await blogApi.updateBlog(blogId, payload);
        alert("Draft saved successfully!");
      };

      // Add base64 image if exists
      if (coverImage && coverImageFile) {
        // Convert image to base64 if it's a file
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          updateBlogWithImage(base64Data);
        };
        reader.readAsDataURL(coverImageFile);
      } else {
        // Update blog using centralized API service without image
        await updateBlogWithImage();
      }

      alert("Draft saved successfully!");
    } catch (err) {
      console.error("Error saving draft:", err);
      alert(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Error Loading Blog</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Blog</h1>
          <p className="text-muted-foreground mt-2">Update your blog post</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setPreview(!preview)}
            className="gap-2"
            disabled={loading}
          >
            {preview ? (
              <>
                <EyeOff className="w-4 h-4" />
                Edit
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Preview
              </>
            )}
          </Button>
        </div>
      </div>

      {!preview ? (
        <div className="space-y-6">
          {/* Cover Image Upload */}
          {coverImage ? (
            <div className="relative rounded-lg overflow-hidden border border-border">
              <Image
                src={coverImage}
                alt="Cover"
                width={1200}
                height={630}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={removeCoverImage}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition cursor-pointer block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-semibold">Upload cover image</p>
              <p className="text-sm text-muted-foreground">
                or drag and drop (Max 5MB)
              </p>
            </label>
          )}

          {/* Title */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Title</label>
            <Input
              placeholder="Enter blog title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg"
              disabled={loading}
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Excerpt</label>
            <Textarea
              placeholder="Brief summary of your blog..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Tags</label>
            <Input
              placeholder="Add tags separated by commas"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Content Editor */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Content</label>
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-secondary border-b border-border p-3 flex gap-2 flex-wrap">
                <button className="px-3 py-1 hover:bg-muted rounded text-sm font-medium">
                  <strong>B</strong>
                </button>
                <button className="px-3 py-1 hover:bg-muted rounded text-sm font-medium">
                  <em>I</em>
                </button>
                <button className="px-3 py-1 hover:bg-muted rounded text-sm font-medium">
                  U
                </button>
                <div className="w-px bg-border mx-1" />
                <button className="px-3 py-1 hover:bg-muted rounded text-sm font-medium">
                  H1
                </button>
                <button className="px-3 py-1 hover:bg-muted rounded text-sm font-medium">
                  H2
                </button>
                <button className="px-3 py-1 hover:bg-muted rounded text-sm font-medium">
                  • List
                </button>
              </div>
              <Textarea
                placeholder="Write your blog content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border-0 resize-none rounded-none"
                rows={15}
                disabled={loading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-6">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={loading}
            >
              Save Draft
            </Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? "Updating..." : "Update Blog"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-secondary rounded-lg p-8 space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Preview</p>
              <h2 className="text-3xl font-bold">{title}</h2>
            </div>
            <p className="text-muted-foreground">{excerpt}</p>
            {tags && (
              <div className="flex flex-wrap gap-2 pt-4">
                {tags.split(",").map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
            <p className="text-muted-foreground whitespace-pre-wrap">
              {content}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function EditBlog({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string>("");

  useEffect(() => {
    async function unwrapParams() {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    }
    unwrapParams();
  }, [params]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Suspense
            fallback={
              <div className="space-y-8">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-60 mt-2" />
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>

                {/* Cover Image Skeleton */}
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Skeleton className="h-8 w-8 mx-auto" />
                  <Skeleton className="h-5 w-40 mt-2" />
                  <Skeleton className="h-4 w-48 mt-1" />
                </div>

                {/* Title Skeleton */}
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-12 w-full" />
                </div>

                {/* Excerpt Skeleton */}
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-20 w-full" />
                </div>

                {/* Tags Skeleton */}
                <div>
                  <Skeleton className="h-4 w-12 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Content Editor Skeleton */}
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <div className="border border-border rounded-lg overflow-hidden">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                </div>

                {/* Action Buttons Skeleton */}
                <div className="flex gap-3 justify-end pt-6">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            }
          >
            <EditBlogContent blogId={id} />
          </Suspense>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
