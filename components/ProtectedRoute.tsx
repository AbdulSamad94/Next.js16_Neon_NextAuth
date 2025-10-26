"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectPath?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  redirectPath = "/login",
}: ProtectedRouteProps) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" && requireAuth) {
      router.push(redirectPath);
    } else if (status === "authenticated" && !requireAuth) {
      // For pages like login/signup, redirect to home if already logged in
      if (redirectPath === "/login" || redirectPath === "/signup") {
        router.push("/");
      }
    }
  }, [status, requireAuth, redirectPath, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-12 w-64" />
        </div>
      </div>
    );
  }

  // If unauthenticated and requireAuth is false (like login page), show the content
  if (status === "unauthenticated" && !requireAuth) {
    return <>{children}</>;
  }

  // If authenticated and requireAuth is false (like login page), redirect will happen via useEffect
  if (status === "authenticated" && !requireAuth) {
    return null; // This shouldn't happen as redirect is handled by useEffect
  }

  // If authenticated and requireAuth is true, show the content
  if (status === "authenticated" && requireAuth) {
    return <>{children}</>;
  }

  // If unauthenticated and requireAuth is true, redirect will happen via useEffect
  if (status === "unauthenticated" && requireAuth) {
    return null; // Redirect will happen in useEffect
  }

  return <>{children}</>;
}