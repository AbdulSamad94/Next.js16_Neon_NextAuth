"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Edit, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Blog {
  id: string;
  title: string;
  status: "published" | "draft";
  views: number;
  date: string;
}

const userBlogs: Blog[] = [
  {
    id: "1",
    title: "The Future of Web Development: Trends to Watch in 2025",
    status: "published",
    views: 1250,
    date: "Oct 24, 2025",
  },
  {
    id: "2",
    title: "Getting Started with React Hooks",
    status: "published",
    views: 890,
    date: "Oct 20, 2025",
  },
  {
    id: "3",
    title: "Advanced TypeScript Patterns",
    status: "draft",
    views: 0,
    date: "Oct 18, 2025",
  },
  {
    id: "4",
    title: "Building Scalable APIs",
    status: "published",
    views: 2100,
    date: "Oct 15, 2025",
  },
];

export default function Dashboard() {
  const [blogs, setBlogs] = useState(userBlogs);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      setBlogs(blogs.filter((blog) => blog.id !== id));
    }
  };

  const publishedCount = blogs.filter((b) => b.status === "published").length;
  const draftCount = blogs.filter((b) => b.status === "draft").length;
  const totalViews = blogs.reduce((sum, b) => sum + b.views, 0);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-12"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">My Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                  Manage your blogs and track performance
                </p>
              </div>
              <Link href="/create">
                <Button>Write New Blog</Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  label: "Published",
                  value: publishedCount,
                  color: "bg-blue-500/10 text-blue-600",
                },
                {
                  label: "Drafts",
                  value: draftCount,
                  color: "bg-amber-500/10 text-amber-600",
                },
                {
                  label: "Total Views",
                  value: totalViews.toLocaleString(),
                  color: "bg-green-500/10 text-green-600",
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`rounded-lg p-6 ${stat.color}`}
                >
                  <p className="text-sm font-medium opacity-75">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Blogs Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((blog, index) => (
                      <motion.tr
                        key={blog.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-border hover:bg-secondary/50 transition"
                      >
                        <td className="px-6 py-4 text-sm font-medium">
                          {blog.title}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              blog.status === "published"
                                ? "bg-green-500/10 text-green-600"
                                : "bg-amber-500/10 text-amber-600"
                            }`}
                          >
                            {blog.status.charAt(0).toUpperCase() +
                              blog.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {blog.views}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {blog.date}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Link href={`/edit/${blog.id}`}>
                              <Button variant="ghost" size="sm" className="gap-2">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(blog.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
