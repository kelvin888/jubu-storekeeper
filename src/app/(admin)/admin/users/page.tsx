"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Pencil, Trash2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Terminal {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  terminalId: string | null;
  terminal: { id: string; name: string } | null;
  createdAt: string;
}

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "TERMINAL_OFFICER",
  terminalId: "",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTerminalId, setFilterTerminalId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [uRes, tRes] = await Promise.all([
      fetch("/api/admin/users"),
      fetch("/api/admin/terminals"),
    ]);
    if (uRes.ok) setUsers(await uRes.json());
    if (tRes.ok) setTerminals(await tRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(u: User) {
    setEditTarget(u);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      terminalId: u.terminalId ?? "",
    });
    setError("");
    setDialogOpen(true);
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!form.name || !form.email || (!editTarget && !form.password) || !form.role) {
      setError(
        "Name, email, role are required. Password is required for new users."
      );
      return;
    }
    setSaving(true);
    setError("");

    const body: Record<string, string | null> = {
      name: form.name,
      email: form.email,
      role: form.role,
      terminalId: form.terminalId || null,
    };
    if (!editTarget || form.password) body.password = form.password;

    const url = editTarget
      ? `/api/admin/users/${editTarget.id}`
      : "/api/admin/users";
    const method = editTarget ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (res.ok) {
      setDialogOpen(false);
      load();
    } else {
      const d = await res.json();
      setError(d.error ?? "Error saving user");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    load();
  }

  const roleLabel = (r: string) =>
    r === "TERMINAL_MANAGER" ? "Manager" : "Officer";

  const filteredUsers = users.filter((u) => {
    const matchesTerminal = !filterTerminalId || u.terminalId === filterTerminalId;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    return matchesTerminal && matchesSearch;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create staff accounts and assign them to terminals.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-1.5" /> New User
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filterTerminalId || "all"}
          onValueChange={(v) => setFilterTerminalId(v === "all" ? "" : (v ?? ""))}
        >
          <SelectTrigger className="w-48">
            <SelectValue>
              {filterTerminalId
                ? (terminals.find((t) => t.id === filterTerminalId)?.name ?? "Unknown")
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
        {(filterTerminalId || searchQuery) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setFilterTerminalId(""); setSearchQuery(""); }}
            className="text-gray-500"
          >
            Clear
          </Button>
        )}
      </div>

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
                Terminal
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-gray-400"
                >
                  Loading…
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-gray-400"
                >
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  {users.length === 0
                    ? "No users yet. Create one to get started."
                    : "No users match the current filters."}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => (
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
                  <TableCell className="text-gray-600 text-sm">
                    {u.terminal?.name ?? (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(u)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 rounded transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit User" : "New User"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g., Emeka Obi"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="emeka@storekeeper.com"
              />
            </div>

            {editTarget && (
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-semibold">Reset Password</p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>
                {editTarget
                  ? "New Password"
                  : "Password"}
              </Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder={editTarget ? "Leave blank to keep current password" : "••••••••"}
              />
              {editTarget && (
                <p className="text-xs text-gray-400">Leave blank to keep the existing password unchanged.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => set("role", v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue>
                    {form.role === "TERMINAL_MANAGER" ? "Terminal Manager" : "Terminal Officer"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TERMINAL_OFFICER">
                    Terminal Officer
                  </SelectItem>
                  <SelectItem value="TERMINAL_MANAGER">
                    Terminal Manager
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Terminal</Label>
              <Select
                value={form.terminalId || "none"}
                onValueChange={(v) => set("terminalId", !v || v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {form.terminalId
                      ? (terminals.find((t) => t.id === form.terminalId)?.name ?? "Unknown")
                      : "— Unassigned —"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Unassigned —</SelectItem>
                  {terminals.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {saving
                ? "Saving…"
                : editTarget
                  ? "Save Changes"
                  : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
