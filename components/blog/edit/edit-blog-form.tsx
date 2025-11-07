"use client";

import { motion } from "framer-motion";
import { EditBlogHeader } from "@/components/blog/edit/edit-blog-header";
import { CoverImageSection } from "@/components/blog/edit/cover-image-section";
import { FormFields } from "@/components/blog/edit/form-fields";
import { ActionButtons } from "@/components/blog/edit/action-buttons";
import Image from "next/image";
import { useSession } from "next-auth/react";

import { Category } from "@/lib/types";

interface EditBlogFormProps {
  title: string;
  setTitle: (title: string) => void;
  excerpt: string;
  setExcerpt: (excerpt: string) => void;
  content: string;
  setContent: (content: string) => void;
  coverImage: string | null;
  preview: boolean;
  setPreview: (preview: boolean) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeCoverImage: () => void;
  handleUpdate: () => void;
  handleSaveDraft: () => void;
  saving: boolean;
  allCategories: Category[];
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
}

export function EditBlogForm({
  title,
  setTitle,
  excerpt,
  setExcerpt,
  content,
  setContent,
  coverImage,
  preview,
  setPreview,
  handleImageUpload,
  removeCoverImage,
  handleUpdate,
  handleSaveDraft,
  saving,
  allCategories,
  selectedCategories,
  setSelectedCategories,
}: EditBlogFormProps) {
  const { data: session } = useSession();

  if (preview) {
    return (
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
            <h2 className="text-3xl font-bold">{title || "Your blog title"}</h2>
          </div>
          {excerpt && (
            <p className="text-muted-foreground text-lg">{excerpt}</p>
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
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <EditBlogHeader
        title="Edit Blog"
        preview={preview}
        setPreview={setPreview}
        saving={saving}
      />

      <div className="space-y-6">
        <CoverImageSection
          coverImage={coverImage}
          handleImageUpload={handleImageUpload}
          removeCoverImage={removeCoverImage}
          saving={saving}
        />

        <FormFields
          title={title}
          setTitle={setTitle}
          excerpt={excerpt}
          setExcerpt={setExcerpt}
          content={content}
          setContent={setContent}
          saving={saving}
          allCategories={allCategories}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
        />

        <ActionButtons
          handleSaveDraft={handleSaveDraft}
          handleUpdate={handleUpdate}
          saving={saving}
        />
      </div>
    </motion.div>
  );
}
