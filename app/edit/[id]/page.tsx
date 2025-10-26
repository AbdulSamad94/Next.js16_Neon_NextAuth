"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Upload, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

// Mock data - replace with real data from backend
const blogData = {
  title: "The Future of Web Development: Trends to Watch in 2025",
  excerpt:
    "Explore the emerging technologies and practices that will shape web development in the coming year.",
  content: "The web development landscape is constantly evolving...",
  tags: "Web Dev, Trends, Technology",
};

export default function EditBlog({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [title, setTitle] = useState(blogData.title);
  const [excerpt, setExcerpt] = useState(blogData.excerpt);
  const [content, setContent] = useState(blogData.content);
  const [tags, setTags] = useState(blogData.tags);
  const [preview, setPreview] = useState(false);

  const handleUpdate = () => {
    console.log({ title, excerpt, content, tags });
    console.log(params);
    alert("Blog updated! (This is a demo)");
  };

  const handleSaveDraft = () => {
    console.log({ title, excerpt, content, tags });
    alert("Draft saved! (This is a demo)");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Edit Blog</h1>
                <p className="text-muted-foreground mt-2">
                  Update your blog post
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
                {/* Cover Image Upload */}
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-semibold">Update cover image</p>
                  <p className="text-sm text-muted-foreground">
                    or drag and drop
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Title
                  </label>
                  <Input
                    placeholder="Enter blog title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Excerpt
                  </label>
                  <Textarea
                    placeholder="Brief summary of your blog..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">Tags</label>
                  <Input
                    placeholder="Add tags separated by commas"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>

                {/* Content Editor */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Content
                  </label>
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
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-6">
                  <Button variant="outline" onClick={handleSaveDraft}>
                    Save Draft
                  </Button>
                  <Button onClick={handleUpdate}>Update Blog</Button>
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
                      {tags.split(",").map((tag) => (
                        <span
                          key={tag}
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
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
