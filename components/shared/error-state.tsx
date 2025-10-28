"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ErrorStateProps {
  title?: string;
  message: string;
  error?: string;
  actionText?: string;
  actionLink?: string;
  onActionClick?: () => void;
  showBackButton?: boolean;
  backLink?: string;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  error,
  actionText,
  actionLink,
  onActionClick,
  showBackButton = false,
  backLink = "/",
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 text-center space-y-4", className)}>
      <p className="text-destructive text-lg font-medium">{title}</p>
      <p className="text-muted-foreground">{message}</p>
      {error && <p className="text-sm text-muted-foreground">{error}</p>}
      
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        {showBackButton && (
          <Link href={backLink}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        )}
        {actionText && (actionLink ? (
          <Link href={actionLink}>
            <Button>{actionText}</Button>
          </Link>
        ) : (
          <Button onClick={onActionClick}>{actionText}</Button>
        ))}
      </div>
    </div>
  );
}