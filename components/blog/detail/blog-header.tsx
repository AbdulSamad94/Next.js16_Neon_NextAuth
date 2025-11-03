"use client";

import { Blog } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Share2, Edit, Trash2 } from "lucide-react";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { calculateReadTime, formatDate } from "@/lib/utils";
import { blogApi } from "@/lib/data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BlogHeaderProps {
  blog: Blog;
  blogId: string;
  session?: Session | null;
}

export function BlogHeader({ blog, session, blogId }: BlogHeaderProps) {
  const [liked, setLiked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const sessionData = useSession();
  const currentSession = session || sessionData.data;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title,
          text: blog?.excerpt || "",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      // Use blogId instead of blog.slug since API now uses ID
      await blogApi.deleteBlog(blogId);

      toast.success("Blog deleted successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete blog"
      );
      setIsDeleting(false);
    }
  };

  const isAuthor = currentSession?.user?.id === blog.author.id;

  return (
    <div className="flex items-center justify-between border-b border-border pb-6">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={blog.author.image || "/placeholder.svg"} />
          <AvatarFallback>
            {blog.author.name?.[0] || blog.author.email[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{blog.author.name || "Anonymous"}</p>
          <p className="text-sm text-muted-foreground">
            {formatDate(blog.createdAt)} • {calculateReadTime(blog.content)} min
            read
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Edit/Delete buttons for the author */}
        {isAuthor && (
          <div className="flex items-center gap-2">
            <Link href={`/edit/${blogId}`}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your blog post and remove it from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Continue"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLiked(!liked)}
          className={liked ? "text-red-500" : ""}
        >
          <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
