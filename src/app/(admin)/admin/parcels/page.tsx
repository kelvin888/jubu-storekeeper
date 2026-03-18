"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Terminal {
  id: string;
  name: string;
}

interface Parcel {
  id: string;
  batchId: string;
  itemDescription: string;
  receiverName: string;
  receiverPhone: string;
  status: string;
  createdAt: string;
  terminal: { id: string; name: string } | null;
  custodian: { id: string; name: string } | null;
}

export default function AdminParcelsPage() {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(15);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [filterTerminal, setFilterTerminal] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "IN_STORE" | "COLLECTED">("ALL");

  // Load terminals for the filter dropdown
  useEffect(() => {
    fetch("/api/admin/terminals")
      .then((r) => r.json())
      .then((data) => setTerminals(data))
      .catch(() => {});
  }, []);

  const fetchParcels = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        ...(query ? { q: query } : {}),
        ...(filterTerminal ? { terminalId: filterTerminal } : {}),
        ...(filterStatus !== "ALL" ? { status: filterStatus } : {}),
      });
      const res = await fetch(`/api/admin/parcels?${params}`);
      if (res.ok) {
        const data = await res.json();
        setParcels(data.parcels);
        setTotal(data.total);
        setPerPage(data.perPage);
      }
    } finally {
      setLoading(false);
    }
  }, [page, query, filterTerminal, filterStatus]);

  useEffect(() => {
    fetchParcels();
  }, [fetchParcels]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  }

  function handleStatusFilter(val: "ALL" | "IN_STORE" | "COLLECTED") {
    setFilterStatus(val);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Global Parcel Search</h1>
        <p className="text-sm text-gray-500 mt-1">
          Search and filter parcels across all terminals.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[240px] max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Batch ID, receiver, item…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
            Search
          </Button>
        </form>

        <Select
          value={filterTerminal || "all"}
          onValueChange={(v) => { setFilterTerminal(v === "all" ? "" : (v ?? "")); setPage(1); }}
        >
          <SelectTrigger className="w-48">
            <SelectValue>
              {filterTerminal
                ? (terminals.find((t) => t.id === filterTerminal)?.name ?? "Unknown")
                : "All Terminals"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Terminals</SelectItem>
            {terminals.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-5">
        {(["ALL", "IN_STORE", "COLLECTED"] as const).map((val) => {
          const labels = { ALL: "All", IN_STORE: "In Store", COLLECTED: "Collected" };
          const active = filterStatus === val;
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

      {/* Table */}
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
                Terminal
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Receiver
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Custodian
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-gray-400">
                  Loading…
                </TableCell>
              </TableRow>
            ) : parcels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center text-gray-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No parcels found.
                </TableCell>
              </TableRow>
            ) : (
              parcels.map((p) => (
                <TableRow key={p.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-xs text-gray-700">
                    {p.batchId}
                  </TableCell>
                  <TableCell className="text-gray-900 text-sm font-medium">
                    {p.itemDescription}
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {p.terminal?.name ?? <span className="text-gray-400 italic">—</span>}
                  </TableCell>
                  <TableCell className="text-gray-700 text-sm">
                    <p>{p.receiverName}</p>
                    <p className="text-xs text-gray-400 font-mono">{p.receiverPhone}</p>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {p.custodian?.name ?? (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            {total === 0
              ? "No items"
              : `Showing ${from}–${to} of ${total} parcel${total !== 1 ? "s" : ""}`}
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
