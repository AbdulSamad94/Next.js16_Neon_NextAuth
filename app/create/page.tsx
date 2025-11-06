"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/shared/loader";
import { motion } from "framer-motion";
import { Upload, Eye, EyeOff, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import { RichTextEditor } from "@/components/RichTextEditor";
import { blogApi, categoryApi } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BlogPayload } from "@/lib/types";

export default function CreateBlog() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [preview, setPreview] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const router = useRouter();
  const { data: session } = useSession();

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await categoryApi.getAllCategories();
        setCategories(response.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, WebP, or GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result as string);
      setCoverImageFile(file);
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
    toast.success("Image selected! It will upload when you publish.");
  };

  const handleAddCategory = (categoryId: string) => {
    if (!selectedCategories.includes(categoryId)) {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
  };

  const handleSubmit = async (status: "draft" | "published") => {
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
      if (status === "draft") {
        setSavingDraft(true);
      } else {
        setPublishing(true);
      }

      const createBlog = async (imageBase64?: string) => {
        const payload: BlogPayload = {
          title,
          excerpt: excerpt.trim() || undefined,
          content,
          status,
          categoryIds: selectedCategories,
        };

        if (imageBase64 && coverImageFile) {
          payload.coverImageBase64 = imageBase64;
          payload.coverImageType = coverImageFile.type;
        }

        const response = await blogApi.createBlog(payload);
        toast.success(
          status === "draft"
            ? "Draft saved successfully!"
            : "Blog published successfully!"
        );

        setTimeout(() => {
          router.push(`/blog/${response.post.slug}`);
        }, 1000);
      };

      if (coverImageFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64Data = reader.result as string;
            await createBlog(base64Data);
          } catch (error) {
            console.error("Error in FileReader callback:", error);
            toast.error(
              error instanceof Error ? error.message : "Failed to create blog"
            );
            setSavingDraft(false);
            setPublishing(false);
          }
        };
        reader.onerror = () => {
          toast.error("Failed to read image file");
          setSavingDraft(false);
          setPublishing(false);
        };
        reader.readAsDataURL(coverImageFile);
      } else {
        await createBlog();
        setSavingDraft(false);
        setPublishing(false);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create blog"
      );
      setSavingDraft(false);
      setPublishing(false);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImageFile(null);
    toast.success("Cover image removed");
  };

  const selectedCategoryNames = categories
    .filter((cat) => selectedCategories.includes(cat.id))
    .map((cat) => cat.name);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Toaster position="top-right" />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Create New Blog</h1>
                <p className="text-muted-foreground mt-2">
                  Share your thoughts with the world
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPreview(!preview)}
                  className="gap-2"
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

                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter blog title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {title.length}/200 characters
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Excerpt (Optional)
                  </label>
                  <Textarea
                    placeholder="Brief summary of your blog..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {excerpt.length}/500 characters
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Categories (Optional)
                  </label>
                  {loadingCategories ? (
                    <div className="text-sm text-muted-foreground">
                      Loading categories...
                    </div>
                  ) : (
                    <>
                      <Select onValueChange={handleAddCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select categories" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id}
                              disabled={selectedCategories.includes(
                                category.id
                              )}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedCategories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {selectedCategories.map((categoryId) => {
                            const category = categories.find(
                              (c) => c.id === categoryId
                            );
                            return (
                              <Badge
                                key={categoryId}
                                variant="secondary"
                                className="gap-1"
                              >
                                {category?.name}
                                <button
                                  onClick={() =>
                                    handleRemoveCategory(categoryId)
                                  }
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor content={content} onChange={setContent} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {content.length} characters (minimum 50 required)
                  </p>
                </div>

                <div className="flex gap-3 justify-end pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit("draft")}
                    disabled={savingDraft || publishing}
                  >
                    {savingDraft ? (
                      <>
                        <Loader className="w-4 h-4 mr-2" size="sm" />
                        Saving...
                      </>
                    ) : (
                      "Save Draft"
                    )}
                  </Button>
                  <Button
                    onClick={() => handleSubmit("published")}
                    disabled={savingDraft || publishing}
                  >
                    {publishing ? (
                      <>
                        <Loader className="w-4 h-4 mr-2" size="sm" />
                        Publishing...
                      </>
                    ) : (
                      "Publish Blog"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {coverImage && (
                  <div className="rounded-lg overflow-hidden">
                    <Image
                      src={coverImage}
                      alt="Cover preview"
                      width={1200}
                      height={630}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
                <div className="bg-secondary rounded-lg p-8 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Preview</p>
                    <h2 className="text-3xl font-bold">
                      {title || "Your blog title"}
                    </h2>
                  </div>
                  {excerpt && (
                    <p className="text-muted-foreground text-lg">{excerpt}</p>
                  )}
                  {selectedCategoryNames.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedCategoryNames.map((name) => (
                        <Badge key={name} variant="outline">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    {session?.user?.image && (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "Author"}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{session?.user?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="prose prose-sm md:prose-base max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: content || "Your blog content will appear here",
                  }}
                />
              </div>
            )}
          </motion.div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
