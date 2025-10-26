"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BlogCard } from "@/components/blog-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, Share2 } from "lucide-react";
import { useState } from "react";

const blogData = {
  id: "1",
  title: "The Future of Web Development: Trends to Watch in 2025",
  author: "Sarah Chen",
  authorAvatar: "/professional-avatar.png",
  date: "Oct 24, 2025",
  readTime: 8,
  tags: ["Web Dev", "Trends", "Technology"],
  coverImage: "/modern-web-dev-workspace.png",
  content: `
    <h2>Introduction</h2>
    <p>The web development landscape is constantly evolving, with new technologies and practices emerging every year. As we look ahead to 2025, there are several key trends that developers should be aware of.</p>
    
    <h2>1. AI-Powered Development Tools</h2>
    <p>Artificial intelligence is revolutionizing how we write code. From intelligent code completion to automated testing, AI tools are becoming essential in the developer's toolkit.</p>
    
    <h2>2. Edge Computing</h2>
    <p>Edge computing brings computation closer to the data source, reducing latency and improving performance. This trend is reshaping how we build scalable applications.</p>
    
    <h2>3. Web Components</h2>
    <p>Web Components continue to gain traction as a standard way to build reusable, encapsulated components that work across different frameworks.</p>
    
    <h2>Conclusion</h2>
    <p>The future of web development is exciting and full of possibilities. By staying informed about these trends, developers can position themselves for success in the coming year.</p>
  `,
};

const relatedBlogs = [
  {
    id: "2",
    title: "Mastering React Server Components",
    excerpt:
      "A deep dive into React Server Components and how they can improve your application performance.",
    author: "Alex Johnson",
    date: "Oct 22, 2025",
    tags: ["React", "Performance"],
    coverImage: "/react-code-editor.jpg",
    readTime: 6,
  },
  {
    id: "3",
    title: "Building Scalable APIs with Next.js",
    excerpt:
      "Learn best practices for building robust and scalable APIs using Next.js route handlers.",
    author: "Emma Davis",
    date: "Oct 20, 2025",
    tags: ["Next.js", "API", "Backend"],
    coverImage: "/api-architecture-diagram.jpg",
    readTime: 7,
  },
  {
    id: "4",
    title: "CSS Grid vs Flexbox: When to Use Each",
    excerpt:
      "Understanding the differences and best use cases for CSS Grid and Flexbox in modern layouts.",
    author: "Michael Park",
    date: "Oct 18, 2025",
    tags: ["CSS", "Layout", "Design"],
    coverImage: "/css-layout-design.jpg",
    readTime: 5,
  },
];

export default function BlogDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<
    Array<{ author: string; text: string }>
  >([
    {
      author: "John Doe",
      text: "Great article! Really helpful insights about the future of web development.",
    },
    {
      author: "Jane Smith",
      text: "I especially liked the section on AI-powered development tools. Looking forward to more content like this!",
    },
  ]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { author: "You", text: newComment }]);
      setNewComment("");
    }
  };
  console.log(params);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Title and Meta */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {blogData.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-balance">
              {blogData.title}
            </h1>
          </div>

          {/* Author Info */}
          <div className="flex items-center justify-between border-b border-border pb-6">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage
                  src={blogData.authorAvatar || "/placeholder.svg"}
                />
                <AvatarFallback>{blogData.author[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{blogData.author}</p>
                <p className="text-sm text-muted-foreground">
                  {blogData.date} • {blogData.readTime} min read
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLiked(!liked)}
                className={liked ? "text-red-500" : ""}
              >
                <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Cover Image */}
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <Image
              src={blogData.coverImage || "/placeholder.svg"}
              alt={blogData.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: blogData.content }} />
          </div>

          {/* Comments Section */}
          <div className="border-t border-border pt-12 space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">
                Comments ({comments.length})
              </h2>

              {/* Add Comment */}
              <div className="mb-8 space-y-4">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="resize-none"
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                    >
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-4"
                  >
                    <Avatar>
                      <AvatarFallback>{comment.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{comment.author}</p>
                      <p className="text-muted-foreground mt-1">
                        {comment.text}
                      </p>
                      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                        <button className="hover:text-foreground transition">
                          Like
                        </button>
                        <button className="hover:text-foreground transition">
                          Reply
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.article>

        {/* Related Posts */}
        <section className="mt-20 pt-12 border-t border-border">
          <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedBlogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <BlogCard {...blog} />
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
