"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface SignOutButtonProps {
  className?: string;
  showLabel?: boolean;
}

export function SignOutButton({ className, showLabel }: SignOutButtonProps) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={
        className ??
        "p-1.5 rounded-md text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
      }
      title="Sign out"
    >
      <LogOut className="w-4 h-4" />
      {showLabel && <span>Sign Out</span>}
    </button>
  );
}
