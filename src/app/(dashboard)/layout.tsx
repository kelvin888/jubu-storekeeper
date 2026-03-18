import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const roleLabel =
    user.role === "SUPER_ADMIN"
      ? "Super Admin"
      : user.role === "TERMINAL_MANAGER"
        ? "Terminal Manager"
        : "Terminal Officer";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top nav */}
      <header className="bg-indigo-600 text-white px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">StoreKeeper Pro</span>
          {user.terminalName && (
            <span className="hidden sm:inline text-indigo-200 text-sm font-medium border-l border-indigo-400 pl-3 ml-1">
              {user.terminalName}
            </span>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/overview" className="text-indigo-100 hover:text-white transition-colors">
            Overview
          </Link>
          <Link href="/checkin" className="text-indigo-100 hover:text-white transition-colors">
            New Check-in
          </Link>
          <Link href="/inventory" className="text-indigo-100 hover:text-white transition-colors">
            Inventory
          </Link>
          {(user.role === "TERMINAL_MANAGER" || user.role === "SUPER_ADMIN") && (
            <Link href="/team" className="text-indigo-100 hover:text-white transition-colors">
              Team
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs text-indigo-200 mt-0.5">{roleLabel}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
            {initials}
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
        © {new Date().getFullYear()} StoreKeeper Pro · Terminal Management System
        {user.terminalName && (
          <span> · {user.terminalName}</span>
        )}
      </footer>
    </div>
  );
}
