"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface Comment {
  author: string;
  text: string;
}

interface BlogCommentsProps {
  blogId: string;
  initialComments?: Comment[];
  session?: Session | null;
}

export function BlogComments({
  blogId,
  initialComments = [],
  session,
}: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const sessionData = useSession();
  const currentSession = session || sessionData.data;

  const handleAddComment = () => {
    if (!currentSession) {
      toast.error("Please login to comment");
      return;
    }

    if (newComment.trim()) {
      setComments([
        ...comments,
        { author: currentSession.user?.name || "You", text: newComment },
      ]);
      setNewComment("");
      toast.success("Comment added!");
    }
  };

  return (
    <div className="border-t border-border pt-12 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">
          Comments ({comments.length})
        </h2>

        {/* Add Comment */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src={currentSession?.user?.image || ""} />
              <AvatarFallback>
                {currentSession?.user?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder={
                  currentSession
                    ? "Share your thoughts..."
                    : "Login to comment..."
                }
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="resize-none"
                disabled={!currentSession}
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || !currentSession}
              >
                Post Comment
              </Button>
            </div>
          </div>
        </div>

        {/* Comments List */}
        {comments.length > 0 ? (
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
                  <p className="text-muted-foreground mt-1">{comment.text}</p>
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
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  );
}
