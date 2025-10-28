"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  actionLink?: string;
  onActionClick?: () => void;
  showBackButton?: boolean;
  backLink?: string;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionText,
  actionLink,
  onActionClick,
  showBackButton = false,
  backLink = "/",
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20 text-center", className)}>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      {description && <p className="text-muted-foreground mb-6">{description}</p>}
      
      <div className="flex flex-col sm:flex-row gap-3">
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