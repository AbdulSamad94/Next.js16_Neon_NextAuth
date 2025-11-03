"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { blogApi } from "@/lib/data";
import { extractTags } from "@/lib/utils";
import { EditBlogForm } from "@/components/blog/edit/edit-blog-form";
import { EditBlogFormSkeleton } from "@/components/blog/edit/edit-blog-form-skeleton";
import { ErrorDisplay } from "@/components/blog/edit/error-display";
import { Blog, BlogPayload } from "@/lib/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function EditBlog({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [tags, setTags] = useState("");
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blog, setBlog] = useState<Blog | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    async function unwrapParams() {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    }
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!id || !session) return;

    async function fetchBlog() {
      try {
        setLoading(true);
        // Fetch blog by ID using centralized API service
        const response = await blogApi.getBlogById(id);
        const fetchedBlog = response.post;

        // Check if the current user is the author of the blog
        if (fetchedBlog.author.id !== session?.user.id) {
          setError("You don't have permission to edit this blog.");
          return;
        }

        setBlog(fetchedBlog);
        setTitle(fetchedBlog.title);
        setExcerpt(fetchedBlog.excerpt || "");
        setContent(fetchedBlog.content);
        setCoverImage(fetchedBlog.coverImage);
        setTags(extractTags(fetchedBlog.content).join(", "));
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError(err instanceof Error ? err.message : "Failed to load blog");
      } finally {
        setLoading(false);
      }
    }

    fetchBlog();
  }, [id, session]);

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
      toast.error("Please enter a title");
      return;
    }

    if (title.length < 5) {
      toast.error("Title must be at least 5 characters");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter content");
      return;
    }

    if (content.length < 50) {
      toast.error("Content must be at least 50 characters");
      return;
    }

    try {
      setSaving(true);

      // Prepare payload

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
        await blogApi.updateBlog(id, payload);
        toast.success("Blog updated successfully!");
        router.push(`/blog/${id}`);
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
    } catch (err) {
      console.error("Error updating blog:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update blog");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    try {
      setSaving(true);

      // Prepare payload

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
        await blogApi.updateBlog(id, payload);
        toast.success("Draft saved successfully!");
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
    } catch (err) {
      console.error("Error saving draft:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <EditBlogFormSkeleton />
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <ErrorDisplay
              title="Access Denied"
              message={error}
              onGoHome={() => (window.location.href = "/")}
            />
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (!blog) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <ErrorDisplay
              title="Blog Not Found"
              message="The blog you're looking for doesn't exist."
              onGoHome={() => (window.location.href = "/")}
            />
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Toaster position="top-right" />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <EditBlogForm
            title={title}
            setTitle={setTitle}
            excerpt={excerpt}
            setExcerpt={setExcerpt}
            content={content}
            setContent={setContent}
            coverImage={coverImage}
            tags={tags}
            setTags={setTags}
            preview={preview}
            setPreview={setPreview}
            handleImageUpload={handleImageUpload}
            removeCoverImage={removeCoverImage}
            handleUpdate={handleUpdate}
            handleSaveDraft={handleSaveDraft}
            saving={saving}
          />
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
