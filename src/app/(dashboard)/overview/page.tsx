"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, CheckCircle2, Archive, UserCheck } from "lucide-react";

interface RecentParcel {
  id: string;
  batchId: string;
  itemDescription: string;
  status: string;
  receiverName: string;
  updatedAt: string;
}

interface Stats {
  checkedInToday: number;
  collectedToday: number;
  inStoreTotal: number;
  myCustody: number;
  recentParcels: RecentParcel[];
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading…</div>;
  }

  if (!stats || "error" in stats) {
    return (
      <div className="text-center py-20 text-gray-500">
        No terminal assigned yet. Contact your admin.
      </div>
    );
  }

  const statCards = [
    {
      label: "Checked In Today",
      value: stats.checkedInToday,
      icon: Package,
      bg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      label: "Collected Today",
      value: stats.collectedToday,
      icon: CheckCircle2,
      bg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Currently In Store",
      value: stats.inStoreTotal,
      icon: Archive,
      bg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      label: "In My Custody",
      value: stats.myCustody,
      icon: UserCheck,
      bg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your terminal activity at a glance.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map(({ label, value, icon: Icon, bg, iconColor }) => (
          <div
            key={label}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <p className="text-gray-500 text-xs font-medium">{label}</p>
            <h4 className="text-3xl font-bold text-gray-900 mt-0.5">{value}</h4>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-10">
        <Link href="/checkin">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
            + New Check-in
          </button>
        </Link>
        <Link href="/inventory">
          <button className="border border-gray-300 hover:border-indigo-400 text-gray-700 hover:text-indigo-600 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
            View Inventory
          </button>
        </Link>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">Recent Activity</h2>
        {stats.recentParcels.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No parcels yet.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
            {stats.recentParcels.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{p.itemDescription}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {p.batchId} · {p.receiverName}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      p.status === "IN_STORE"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {p.status === "IN_STORE" ? "In Store" : "Collected"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(p.updatedAt).toLocaleDateString("en-NG", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
