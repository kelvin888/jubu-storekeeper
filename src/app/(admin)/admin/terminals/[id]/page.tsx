"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Users,
  Package,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface RecentParcel {
  id: string;
  batchId: string;
  status: string;
  receiverName: string;
  itemDescription: string;
  createdAt: string;
}

interface TerminalDetail {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  users: StaffMember[];
  parcels: RecentParcel[];
  _count: { users: number; parcels: number };
  inStoreCount: number;
  collectedCount: number;
  totalRevenue: number;
}

export default function TerminalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [terminal, setTerminal] = useState<TerminalDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/terminals/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setTerminal(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const fmt = (n: number) =>
    "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2 });

  const roleLabel = (r: string) =>
    r === "TERMINAL_MANAGER" ? "Manager" : "Officer";

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">Loading terminal…</div>
    );
  }

  if (!terminal) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Terminal not found.</p>
        <Link
          href="/admin/terminals"
          className="text-indigo-600 hover:underline text-sm mt-2 inline-block"
        >
          Back to Terminals
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back + Header */}
      <Link
        href="/admin/terminals"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Terminals
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-700" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{terminal.name}</h1>
          </div>
          <p className="text-sm text-gray-500 ml-13">{terminal.location}</p>
          <p className="text-xs text-gray-400 mt-1">
            Created{" "}
            {new Date(terminal.createdAt).toLocaleDateString("en-NG", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-slate-500 text-xs font-medium">Total Staff</p>
          <h4 className="text-2xl font-bold text-slate-900 mt-0.5">
            {terminal._count.users}
          </h4>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-slate-500 text-xs font-medium">Total Parcels</p>
          <h4 className="text-2xl font-bold text-slate-900 mt-0.5">
            {terminal._count.parcels}
          </h4>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-slate-500 text-xs font-medium">In Store</p>
          <h4 className="text-2xl font-bold text-slate-900 mt-0.5">
            {terminal.inStoreCount}
          </h4>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-slate-500 text-xs font-medium">Revenue (Collected)</p>
          <h4 className="text-xl font-bold text-slate-900 mt-0.5">
            {fmt(terminal.totalRevenue)}
          </h4>
          <p className="text-xs text-gray-400">{terminal.collectedCount} pickups</p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-gray-900 mb-3">
          Staff ({terminal._count.users})
        </h2>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Name
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Email
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Role
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Joined
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {terminal.users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-10 text-gray-400"
                  >
                    No staff assigned to this terminal.
                  </TableCell>
                </TableRow>
              ) : (
                terminal.users.map((u) => (
                  <TableRow key={u.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {u.name}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {u.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.role === "TERMINAL_MANAGER" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {roleLabel(u.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {new Date(u.createdAt).toLocaleDateString("en-NG", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Recent Parcels */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">
          Recent Parcels (last 5)
        </h2>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Batch ID
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Item
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Receiver
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {terminal.parcels.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-gray-400"
                  >
                    No parcels at this terminal yet.
                  </TableCell>
                </TableRow>
              ) : (
                terminal.parcels.map((p) => (
                  <TableRow key={p.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-xs text-gray-700">
                      {p.batchId}
                    </TableCell>
                    <TableCell className="text-gray-900 text-sm">
                      {p.itemDescription}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {p.receiverName}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          p.status === "IN_STORE"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {p.status === "IN_STORE" ? "In Store" : "Collected"}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {new Date(p.createdAt).toLocaleDateString("en-NG", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
