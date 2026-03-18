import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login");

  const initials = (session.user.name ?? "SA")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f6f6]">
      {/* Sidebar */}
      <aside
        className="w-64 flex flex-col shrink-0 text-white"
        style={{ background: "linear-gradient(180deg, #4c1d95 0%, #2e1065 100%)" }}
      >
        <div className="p-5 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/10">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-none">StoreKeeper Pro</h1>
              <p className="text-white/60 text-xs mt-1">Terminal Management</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 flex flex-col gap-1">
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/10 border border-white/5 text-sm font-medium">
              Dashboard
            </Link>
            <Link href="/admin/terminals" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-white/90">
              Terminals
            </Link>
            <Link href="/admin/parcels" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-white/90">
              Parcels
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-white/90">
              Staff
            </Link>
            <div className="mt-auto pt-4 border-t border-white/10">
              <SignOutButton
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-white/90 w-full text-left"
                showLabel
              />
            </div>
          </nav>

          {/* Status */}
          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider text-white/50">System Status</span>
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>
            <p className="text-xs font-semibold">Healthy &amp; Active</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-slate-900 text-lg font-bold tracking-tight">Admin Overview</h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 leading-none">{session.user.name}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Super Admin</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-sm font-bold text-purple-700">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
