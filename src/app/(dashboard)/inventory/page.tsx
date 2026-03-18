"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ParcelStatus } from "@prisma/client";

interface Parcel {
  id: string;
  batchId: string;
  itemDescription: string;
  itemCategory: string | null;
  receiverPhone: string;
  status: ParcelStatus;
  createdAt: string;
  custodian: { id: string; name: string } | null;
}

export default function InventoryPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "IN_STORE" | "COLLECTED">("ALL");

  const fetchParcels = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        ...(query ? { search: query } : {}),
        ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
      });
      const res = await fetch(`/api/parcels?${params}`);
      if (res.ok) {
        const data = await res.json();
        setParcels(data.parcels);
        setTotal(data.total);
        setPerPage(data.perPage);
      }
    } finally {
      setLoading(false);
    }
  }, [page, query, statusFilter]);

  useEffect(() => {
    fetchParcels();
  }, [fetchParcels]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  }

  function handleStatusFilter(val: "ALL" | "IN_STORE" | "COLLECTED") {
    setStatusFilter(val);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Overview</h1>
        <Link href="/checkin">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            + New Check-in
          </Button>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(["ALL", "IN_STORE", "COLLECTED"] as const).map((val) => {
          const labels = { ALL: "All", IN_STORE: "In Store", COLLECTED: "Collected" };
          const active = statusFilter === val;
          return (
            <button
              key={val}
              onClick={() => handleStatusFilter(val)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600"
              }`}
            >
              {labels[val]}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by item, receiver, phone or batch ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Item Description
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Custodian (Staff)
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Receiver Phone
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Date Received
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-gray-400">
                  Loading…
                </TableCell>
              </TableRow>
            ) : parcels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-gray-400">
                  No parcels found.
                </TableCell>
              </TableRow>
            ) : (
              parcels.map((parcel) => (
                <TableRow key={parcel.id} className="hover:bg-gray-50">
                  <TableCell>
                    <p className="font-medium text-gray-900">{parcel.itemDescription}</p>
                    {parcel.itemCategory && (
                      <p className="text-xs text-gray-400 mt-0.5">{parcel.itemCategory}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={parcel.status} />
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {parcel.custodian?.name ?? (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-700 font-mono text-sm">
                    {parcel.receiverPhone}
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {new Date(parcel.createdAt).toLocaleDateString("en-NG", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {parcel.status === ParcelStatus.IN_STORE ? (
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/pickup/${parcel.id}`}
                          className="text-indigo-600 hover:underline text-sm font-semibold"
                        >
                          Pickup
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link
                          href={`/inventory/${parcel.id}`}
                          className="text-gray-500 hover:underline text-sm font-medium"
                        >
                          Edit
                        </Link>
                      </div>
                    ) : (
                      <Link
                        href={`/inventory/${parcel.id}`}
                        className="text-gray-500 hover:underline text-sm font-medium"
                      >
                        View History
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            {total === 0
              ? "No items"
              : `Showing ${from} to ${to} of ${total} item${total !== 1 ? "s" : ""}`}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
