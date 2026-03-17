import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { Building2, Users, Package, TrendingUp, ArrowRight } from "lucide-react";
import { Role } from "@prisma/client";

export default async function AdminOverviewPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Admin";

  const [terminalCount, userCount, parcelCount] = await Promise.all([
    prisma.terminal.count(),
    prisma.user.count({ where: { role: { not: Role.SUPER_ADMIN } } }),
    prisma.parcel.count(),
  ]);

  return (
    <div>
      {/* Welcome Banner */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Welcome back, {firstName}</h3>
          <p className="text-slate-500 mt-1">Here is a quick overview of your terminal network performance today.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-700" />
            </div>
            <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Active
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Active Terminals</p>
          <h4 className="text-3xl font-bold text-slate-900 mt-1">{terminalCount}</h4>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Active
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Staff Members</p>
          <h4 className="text-3xl font-bold text-slate-900 mt-1">{userCount}</h4>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Total
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Parcels</p>
          <h4 className="text-3xl font-bold text-slate-900 mt-1">{parcelCount.toLocaleString()}</h4>
        </div>
      </div>

      {/* Quick Management */}
      <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Management</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Manage Terminals Card */}
        <div className="group relative overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-sm transition-all hover:-translate-y-1">
          <div className="p-8 flex flex-col h-full relative z-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
              style={{ backgroundColor: "#6b21a8", boxShadow: "0 8px 20px -4px rgba(107,33,168,0.3)" }}>
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900">Manage Terminals</h4>
            <p className="text-slate-500 mt-3 mb-8 leading-relaxed max-w-sm">
              Configure terminal locations, monitor performance and manage all store points across your network.
            </p>
            <div className="mt-auto">
              <Link href="/admin/terminals">
                <button
                  className="text-white font-bold py-4 px-8 rounded-2xl transition-all inline-flex items-center gap-2 group-hover:gap-4"
                  style={{ backgroundColor: "#6b21a8" }}
                >
                  Open Terminal Console
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Building2 className="w-48 h-48 text-purple-900" />
          </div>
        </div>

        {/* Manage Users Card */}
        <div className="group relative overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-sm transition-all hover:-translate-y-1">
          <div className="p-8 flex flex-col h-full relative z-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
              style={{ backgroundColor: "#ec5b13", boxShadow: "0 8px 20px -4px rgba(236,91,19,0.3)" }}>
              <Users className="w-7 h-7 text-white" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900">Manage Users</h4>
            <p className="text-slate-500 mt-3 mb-8 leading-relaxed max-w-sm">
              Control staff access, assign specific terminal roles, and manage authentication protocols for secure operations.
            </p>
            <div className="mt-auto">
              <Link href="/admin/users">
                <button
                  className="text-white font-bold py-4 px-8 rounded-2xl transition-all inline-flex items-center gap-2 group-hover:gap-4"
                  style={{ backgroundColor: "#ec5b13" }}
                >
                  Manage Permissions
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-48 h-48 text-orange-900" />
          </div>
        </div>
      </div>
    </div>
  );
}

