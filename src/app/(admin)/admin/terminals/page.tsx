"use client";

import { useState, useEffect, useCallback } from "react";
import { Building2, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Terminal {
  id: string;
  name: string;
  location: string;
  _count: { users: number; parcels: number };
}

const EMPTY = { name: "", location: "" };

export default function TerminalsPage() {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Terminal | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/terminals");
    if (res.ok) setTerminals(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(t: Terminal) {
    setEditTarget(t);
    setForm({ name: t.name, location: t.location });
    setError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.location.trim()) {
      setError("Both name and location are required.");
      return;
    }
    setSaving(true);
    setError("");

    const url = editTarget
      ? `/api/admin/terminals/${editTarget.id}`
      : "/api/admin/terminals";
    const method = editTarget ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (res.ok) {
      setDialogOpen(false);
      load();
    } else {
      const d = await res.json();
      setError(d.error ?? "Error saving terminal");
    }
  }

  async function handleDelete(id: string) {
    if (
      !confirm(
        "Delete this terminal? Staff assigned to it will be unassigned. This cannot be undone."
      )
    )
      return;
    await fetch(`/api/admin/terminals/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Terminals</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all terminal locations.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-1.5" /> New Terminal
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-20">Loading…</p>
      ) : terminals.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No terminals yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {terminals.map((t) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">
                    {t.name}
                  </CardTitle>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(t)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 rounded transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{t.location}</p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>
                    <strong>{t._count.users}</strong> staff
                  </span>
                  <span>
                    <strong>{t._count.parcels}</strong> parcels
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Terminal" : "New Terminal"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="space-y-1.5">
              <Label htmlFor="tname">Terminal Name</Label>
              <Input
                id="tname"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g., Oshodi Terminal"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tlocation">Location</Label>
              <Input
                id="tlocation"
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="e.g., Oshodi Interchange, Lagos"
              />
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
                  : "Create Terminal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
