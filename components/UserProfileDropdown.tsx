"use client";

import { User, LogOut, Settings, UserCircle } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";

export function UserProfileDropdown() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-transparent hover:ring-primary/30 transition-all duration-200"
        >
          {user.image ? (
            <Image
              width={100}
              height={100}
              src={user.image || "/placeholder.svg"}
              alt={user.name || "User profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary to-primary/80 text-primary-foreground">
              <UserCircle className="w-5 h-5" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-0 shadow-lg">
        {/* User info section with enhanced styling */}
        <div className="px-4 py-3 border-b border-border bg-muted/40">
          <p className="font-semibold text-sm text-foreground truncate">
            {user.name || "User"}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {user.email}
          </p>
        </div>

        {/* Menu items with improved spacing and hover states */}
        <div className="py-1">
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors duration-150 rounded-none"
            >
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">My Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors duration-150 rounded-none"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Settings</span>
            </Link>
          </DropdownMenuItem>
        </div>

        {/* Sign out button with destructive styling */}
        <div className="border-t border-border py-1">
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-destructive/10 transition-colors duration-150 rounded-none text-destructive hover:text-destructive focus:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
