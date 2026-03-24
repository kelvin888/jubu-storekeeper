"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ImageOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { ImageLightbox } from "@/components/ImageLightbox";
import { ParcelStatus } from "@prisma/client";

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
  createdAt: string;
  terminal: { id: string; name: string; location: string } | null;
  custodian: { id: string; name: string; email: string } | null;
  handover: { id: string; idVerified: boolean; confirmedAt: string } | null;
  images: ParcelImage[];
}

export default function AdminParcelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/parcels/${id}`)
      .then((r) => r.json())
      .then((data) => { setParcel(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading…</div>;
  }

  if (!parcel || !("id" in parcel)) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Parcel not found.</p>
        <Link href="/admin/parcels" className="text-indigo-400 hover:underline text-sm mt-2 inline-block">
          Back to Parcels
        </Link>
      </div>
    );
  }

  const fmt = (v: string) =>
    "₦ " + (parseFloat(v) || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 });

  const checkInPhotos = parcel.images.filter((img) => img.type === "CHECK_IN");
  const handoverPhotos = parcel.images.filter((img) => img.type === "HANDOVER");
  const hasPhotos = checkInPhotos.length > 0 || handoverPhotos.length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/admin/parcels"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Parcels
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{parcel.itemDescription}</h1>
          <p className="text-sm text-gray-400 mt-0.5 font-mono">#{parcel.batchId}</p>
        </div>
        <StatusBadge status={parcel.status} />
      </div>

      {/* Handover banner */}
      {parcel.status === ParcelStatus.COLLECTED && parcel.handover && (
        <Card className="mb-4 border-emerald-500/30 bg-emerald-900/20">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Collected &amp; Handed Over</p>
                <p className="text-xs text-emerald-500">
                  {new Date(parcel.handover.confirmedAt).toLocaleString("en-NG")}
                  {parcel.handover.idVerified && " · ID Verified"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evidence Photos */}
      <Card className="mb-4 bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-indigo-300">Evidence Photos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasPhotos && (
            <div className="flex items-center gap-2 text-gray-500 py-2">
              <ImageOff className="w-4 h-4" />
              <span className="text-sm">No photos recorded for this parcel.</span>
            </div>
          )}
          {checkInPhotos.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
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
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
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

      {/* Parcel Details */}
      <Card className="mb-4 bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-indigo-300">Item Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Description</p>
            <p className="text-white font-medium">{parcel.itemDescription}</p>
          </div>
          {parcel.itemCategory && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Category</p>
              <p className="text-white">{parcel.itemCategory}</p>
            </div>
          )}
          {parcel.driverName && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Driver</p>
              <p className="text-white">{parcel.driverName}</p>
            </div>
          )}
          {parcel.vehicleNumber && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Vehicle</p>
              <p className="text-white">{parcel.vehicleNumber}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Checked In</p>
            <p className="text-white">{new Date(parcel.createdAt).toLocaleString("en-NG")}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Terminal</p>
            <p className="text-white">{parcel.terminal?.name ?? "—"}</p>
            {parcel.terminal?.location && (
              <p className="text-xs text-gray-400">{parcel.terminal.location}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* People */}
      <Card className="mb-4 bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-indigo-300">Sender &amp; Receiver</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Sender</p>
            <p className="text-white font-medium">{parcel.senderName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Receiver</p>
            <p className="text-white font-medium">{parcel.receiverName}</p>
            <p className="text-xs text-gray-400 font-mono">{parcel.receiverPhone}</p>
          </div>
          {parcel.custodian && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Custodian</p>
              <p className="text-white">{parcel.custodian.name}</p>
              <p className="text-xs text-gray-400">{parcel.custodian.email}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fees */}
      <Card className="mb-4 bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-indigo-300">Fees</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Delivery Fee</span>
            <span className="text-white">{fmt(parcel.deliveryFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Storage Fee</span>
            <span className="text-white">{fmt(parcel.storageFee)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-white/10 pt-2 mt-2">
            <span className="text-gray-300">Total</span>
            <span className="text-indigo-300 text-base">
              {fmt(String((parseFloat(parcel.deliveryFee) || 0) + (parseFloat(parcel.storageFee) || 0)))}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
