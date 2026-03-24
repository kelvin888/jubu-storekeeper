"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ImageOff } from "lucide-react";
import { ImageLightbox } from "@/components/ImageLightbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { ParcelStatus } from "@prisma/client";

interface StaffMember {
  id: string;
  name: string;
  role: string;
}

interface Handover {
  id: string;
  idVerified: boolean;
  confirmedAt: string;
}

interface ParcelImage {
  id: string;
  url: string;
  type: "CHECK_IN" | "HANDOVER";
}

interface Parcel {
  id: string;
  batchId: string;
  itemDescription: string;
  itemCategory: string | null;
  driverName: string | null;
  vehicleNumber: string | null;
  senderName: string;
  receiverName: string;
  receiverPhone: string;
  deliveryFee: string;
  storageFee: string;
  status: ParcelStatus;
  custodianId: string | null;
  custodian: { id: string; name: string } | null;
  handover: Handover | null;
  images: ParcelImage[];
  createdAt: string;
}

export default function InventoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    itemDescription: "",
    itemCategory: "",
    driverName: "",
    vehicleNumber: "",
    senderName: "",
    receiverName: "",
    receiverPhone: "",
    deliveryFee: "",
    storageFee: "",
    custodianId: "",
  });

  useEffect(() => {
    async function load() {
      const [parcelRes, staffRes] = await Promise.all([
        fetch(`/api/parcels/${id}`),
        fetch("/api/staff"),
      ]);

      if (parcelRes.ok) {
        const p: Parcel = await parcelRes.json();
        setParcel(p);
        setForm({
          itemDescription: p.itemDescription,
          itemCategory: p.itemCategory ?? "",
          driverName: p.driverName ?? "",
          vehicleNumber: p.vehicleNumber ?? "",
          senderName: p.senderName,
          receiverName: p.receiverName,
          receiverPhone: p.receiverPhone,
          deliveryFee: p.deliveryFee,
          storageFee: p.storageFee,
          custodianId: p.custodianId ?? "",
        });
      }

      if (staffRes.ok) {
        setStaff(await staffRes.json());
      }

      setLoading(false);
    }
    load();
  }, [id]);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const res = await fetch(`/api/parcels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        deliveryFee: parseFloat(form.deliveryFee) || 0,
        storageFee: parseFloat(form.storageFee) || 0,
        custodianId: form.custodianId || null,
      }),
    });

    setSaving(false);

    if (res.ok) {
      setSuccess(true);
      const updated = await res.json();
      setParcel((prev) => prev ? { ...prev, ...updated } : prev);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to save changes");
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading…</div>;
  }

  if (!parcel) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Parcel not found.</p>
        <Link href="/inventory" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
          Back to Inventory
        </Link>
      </div>
    );
  }

  const isCollected = parcel.status === ParcelStatus.COLLECTED;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/inventory"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Inventory
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isCollected ? "Parcel History" : "Update Parcel"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Batch ID: #{parcel.batchId}</p>
        </div>
        <StatusBadge status={parcel.status} />
      </div>

      {/* Handover info for collected parcels */}
      {isCollected && parcel.handover && (
        <Card className="mb-4 border-emerald-200 bg-emerald-50">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <p className="text-sm font-semibold">Collected &amp; Handed Over</p>
                <p className="text-xs text-emerald-600">
                  {new Date(parcel.handover.confirmedAt).toLocaleString("en-NG")}{" "}
                  {parcel.handover.idVerified && "· ID Verified"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evidence Photos */}
      {(() => {
        const checkInPhotos = parcel.images.filter((img) => img.type === "CHECK_IN");
        const handoverPhotos = parcel.images.filter((img) => img.type === "HANDOVER");
        const hasAny = checkInPhotos.length > 0 || handoverPhotos.length > 0;

        return (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-indigo-600">Evidence Photos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasAny && (
                <div className="flex items-center gap-2 text-gray-400 py-2">
                  <ImageOff className="w-4 h-4" />
                  <span className="text-sm">No photos recorded for this parcel.</span>
                </div>
              )}
              {checkInPhotos.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Arrival — Check-in
                  </p>
                  <ImageLightbox
                    images={checkInPhotos.map((img) => ({ id: img.id, url: img.url, alt: "Check-in evidence" }))}
                    thumbnailClassName="w-24 h-24"
                    accentColor="indigo"
                  />
                </div>
              )}
              {handoverPhotos.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Collection — Handover
                  </p>
                  <ImageLightbox
                    images={handoverPhotos.map((img) => ({ id: img.id, url: img.url, alt: "Handover evidence" }))}
                    thumbnailClassName="w-24 h-24"
                    accentColor="emerald"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
          Changes saved successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Item Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-indigo-600">Item Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="itemDescription">Item Description</Label>
              <Input
                id="itemDescription"
                value={form.itemDescription}
                onChange={(e) => set("itemDescription", e.target.value)}
                disabled={isCollected}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="itemCategory">Item Category</Label>
                <Input
                  id="itemCategory"
                  value={form.itemCategory}
                  onChange={(e) => set("itemCategory", e.target.value)}
                  disabled={isCollected}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="driverName">Driver Name</Label>
                <Input
                  id="driverName"
                  value={form.driverName}
                  onChange={(e) => set("driverName", e.target.value)}
                  disabled={isCollected}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sender & Receiver */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-indigo-600">Sender &amp; Receiver</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="senderName">Sender Name</Label>
                <Input
                  id="senderName"
                  value={form.senderName}
                  onChange={(e) => set("senderName", e.target.value)}
                  disabled={isCollected}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="receiverName">Receiver Name</Label>
                <Input
                  id="receiverName"
                  value={form.receiverName}
                  onChange={(e) => set("receiverName", e.target.value)}
                  disabled={isCollected}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="receiverPhone">Receiver Phone</Label>
              <Input
                id="receiverPhone"
                value={form.receiverPhone}
                onChange={(e) => set("receiverPhone", e.target.value)}
                disabled={isCollected}
              />
            </div>
          </CardContent>
        </Card>

        {/* Fees */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-indigo-600">Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="deliveryFee">Delivery Fee (₦)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₦</span>
                  <Input
                    id="deliveryFee"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-7"
                    value={form.deliveryFee}
                    onChange={(e) => set("deliveryFee", e.target.value)}
                    disabled={isCollected}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="storageFee">Storage Fee (₦)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₦</span>
                  <Input
                    id="storageFee"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-7"
                    value={form.storageFee}
                    onChange={(e) => set("storageFee", e.target.value)}
                    disabled={isCollected}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custodian assignment — only for active (in-store) parcels */}
        {!isCollected && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-indigo-600">Assign Custodian</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label htmlFor="custodian">Staff Responsible</Label>
                <Select
                  value={form.custodianId || "unassigned"}
                  onValueChange={(val) => set("custodianId", !val || val === "unassigned" ? "" : val)}
                >
                  <SelectTrigger id="custodian">
                    <SelectValue placeholder="Select staff member…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">— Unassigned —</SelectItem>
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {!isCollected && (
          <div className="flex gap-3 pt-1">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-11 text-base"
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
            <Link href={`/pickup/${parcel.id}`}>
              <Button
                type="button"
                variant="outline"
                className="h-11 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              >
                Proceed to Pickup
              </Button>
            </Link>
          </div>
        )}
      </form>
    </div>
  );
}
