"use client";

import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  User,
  Truck,
  Camera,
  Receipt,
  ImageOff,
  Printer,
  RefreshCw,
  X,
  Check,
} from "lucide-react";

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
  status: string;
  createdAt: string;
  terminal: { id: string; name: string; location: string } | null;
  custodian: { id: string; name: string; email: string } | null;
  handover: { id: string; idVerified: boolean; confirmedAt: string; note: string | null; overriddenBy: string | null } | null;
  images: ParcelImage[];
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ children, color = "text-violet-700" }: { children: React.ReactNode; color?: string }) {
  return (
    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-2 ${color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      {children}
    </p>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <div className="text-sm font-medium text-slate-800 leading-relaxed">{children}</div>
    </div>
  );
}

export default function AdminParcelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [loading, setLoading] = useState(true);
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const [lbPhotos, setLbPhotos] = useState<ParcelImage[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [paymentNote, setPaymentNote] = useState("");
  const [overrideError, setOverrideError] = useState("");

  function openLightbox(photos: ParcelImage[], index: number) {
    setLbPhotos(photos);
    setLbIndex(index);
    setLbOpen(true);
  }

  const lbPrev = useCallback(() => setLbIndex((i) => (i - 1 + lbPhotos.length) % lbPhotos.length), [lbPhotos.length]);
  const lbNext = useCallback(() => setLbIndex((i) => (i + 1) % lbPhotos.length), [lbPhotos.length]);

  useEffect(() => {
    if (!lbOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") lbPrev();
      if (e.key === "ArrowRight") lbNext();
      if (e.key === "Escape") setLbOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lbOpen, lbPrev, lbNext]);

  useEffect(() => {
    fetch(`/api/admin/parcels/${id}`)
      .then((r) => r.json())
      .then((data) => { setParcel(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  function printLabel() {
    if (!parcel) return;
    const win = window.open("", "_blank", "width=460,height=340");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Parcel Label</title>
<style>
  body { font-family: monospace; padding: 24px; font-size: 13px; color: #111; }
  h2 { font-size: 18px; margin: 0 0 12px; }
  .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .label { color: #666; }
  hr { border: none; border-top: 1px dashed #999; margin: 12px 0; }
</style></head><body onload="window.print();window.close()">
<h2>PARCEL LABEL</h2>
<div class="row"><span class="label">Batch ID</span><strong>${parcel.batchId}</strong></div>
<div class="row"><span class="label">Description</span><span>${parcel.itemDescription}</span></div>
<hr/>
<div class="row"><span class="label">Sender</span><span>${parcel.senderName}</span></div>
<div class="row"><span class="label">Receiver</span><span>${parcel.receiverName}</span></div>
<div class="row"><span class="label">Phone</span><span>${parcel.receiverPhone}</span></div>
<hr/>
<div class="row"><span class="label">Terminal</span><span>${parcel.terminal?.name ?? "—"}</span></div>
<div class="row"><span class="label">Status</span><strong>${parcel.status}</strong></div>
</body></html>`);
    win.document.close();
  }

  async function updateStatus(newStatus: string) {
    setOverrideError("");
    setStatusUpdating(true);
    const res = await fetch(`/api/admin/parcels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, note: paymentNote }),
    });
    if (res.ok) {
      setParcel(await res.json());
      setShowStatusModal(false);
      setPendingStatus(null);
      setPaymentNote("");
    } else {
      const body = await res.json().catch(() => ({}));
      setOverrideError(body?.error ?? "Update failed. Please try again.");
    }
    setStatusUpdating(false);
  }

  if (loading) {
    return (
      <div className="pb-8 flex items-center justify-center py-20">
        <p className="text-sm animate-pulse text-slate-400">Loading…</p>
      </div>
    );
  }

  if (!parcel || !("id" in parcel)) {
    return (
      <div className="pb-8 flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-slate-500">Parcel not found.</p>
        <Link href="/admin/parcels" className="text-sm font-semibold text-violet-600 hover:underline">
          Back to Parcels
        </Link>
      </div>
    );
  }

  const fmt = (v: string) =>
    "₦ " + (parseFloat(v) || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 });

  const total = (parseFloat(parcel.deliveryFee) || 0) + (parseFloat(parcel.storageFee) || 0);
  const checkInPhotos = parcel.images.filter((img) => img.type === "CHECK_IN");
  const handoverPhotos = parcel.images.filter((img) => img.type === "HANDOVER");
  const allPhotos = [...checkInPhotos, ...handoverPhotos];
  const isCollected = parcel.status === "COLLECTED";

  return (
    <div className="pb-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── Breadcrumb + Actions ── */}
        <nav className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
            <Link href="/admin/parcels" className="hover:text-violet-600 transition-colors">
              Parcels
            </Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            <span className="text-violet-700 font-semibold">Parcel Details</span>
          </div>
          <div className="flex gap-3">
            <button
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 bg-white hover:border-violet-300 hover:text-violet-700 transition-colors flex items-center gap-1.5 shadow-sm"
              onClick={printLabel}
            >
              <Printer className="w-4 h-4" />
              Print Label
            </button>
            <button
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-violet-600 text-white shadow-md hover:bg-violet-700 transition-colors flex items-center gap-1.5 active:scale-95"
              onClick={() => setShowStatusModal(true)}
            >
              <RefreshCw className="w-4 h-4" />
              Update Status
            </button>
          </div>
        </nav>

        {/* ── Identity Hero Card ── */}
        <div
          className="rounded-3xl p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #4c1d95, #2e1065)" }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-20"
            style={{ background: "#a78bfa" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${isCollected ? "bg-emerald-500/20 text-emerald-300" : "bg-violet-400/20 text-violet-200"}`}>
                {isCollected ? "Collected" : "In Store"}
              </span>
              <span className="text-sm font-medium text-violet-300">#{parcel.batchId}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
              {parcel.itemDescription}
            </h1>
            {parcel.itemCategory && (
              <p className="mt-2 max-w-lg text-sm text-violet-200/70">{parcel.itemCategory}</p>
            )}
          </div>
          <div className="flex items-center gap-4 relative z-10 shrink-0">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-tighter font-bold mb-1 text-violet-300">Current Terminal</p>
              <p className="text-lg font-bold text-amber-300">{parcel.terminal?.name ?? "—"}</p>
              {parcel.terminal?.location && (
                <p className="text-xs mt-0.5 text-violet-200/70">{parcel.terminal.location}</p>
              )}
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-white/10 text-amber-300">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* ── Main 3-col Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: 2 cols */}
          <div className="lg:col-span-2 space-y-8">

            {/* Item Logistics */}
            <Card className="p-8">
              <SectionLabel>Item Logistics</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                <Field label="Description">{parcel.itemDescription}</Field>
                {parcel.driverName ? (
                  <Field label="Driver Assigned">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-violet-50 flex items-center justify-center shrink-0">
                        <Truck className="w-3.5 h-3.5 text-violet-500" />
                      </div>
                      <span>{parcel.driverName}</span>
                    </div>
                  </Field>
                ) : (
                  <Field label="Driver Assigned"><span className="text-slate-300">—</span></Field>
                )}
                <Field label="Checked In">
                  {new Date(parcel.createdAt).toLocaleString("en-NG", {
                    day: "2-digit", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </Field>
                {parcel.vehicleNumber && (
                  <Field label="Vehicle Number">{parcel.vehicleNumber}</Field>
                )}
                {parcel.custodian && (
                  <Field label="Custodian">
                    <div>
                      <p>{parcel.custodian.name}</p>
                      <p className="text-xs mt-0.5 text-slate-400">{parcel.custodian.email}</p>
                    </div>
                  </Field>
                )}
              </div>
            </Card>

            {/* Sender & Receiver */}
            <Card className="overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                <div className="p-8">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-6 text-violet-600">Sender Details</p>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold leading-tight text-slate-800">{parcel.senderName}</h4>
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-slate-50/60">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-6 text-amber-600">Receiver Details</p>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold leading-tight text-slate-800">{parcel.receiverName}</h4>
                      <p className="text-sm mt-1 font-mono text-slate-400">{parcel.receiverPhone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: 1 col */}
          <div className="space-y-8">

            {/* Evidence Photos */}
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <SectionLabel color="text-violet-700">Evidence Photos</SectionLabel>
                {allPhotos.length > 0 && (
                  <span className="text-xs font-bold text-violet-500">
                    {allPhotos.length} photo{allPhotos.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {allPhotos.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 rounded-2xl border border-dashed border-slate-200">
                  <ImageOff className="w-6 h-6 text-slate-300" />
                  <p className="text-xs text-center text-slate-400">No evidence photos recorded</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {checkInPhotos.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-violet-400">
                        Arrival — Check-in
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {checkInPhotos.map((img, i) => (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => openLightbox(checkInPhotos, i)}
                            className="aspect-square rounded-2xl overflow-hidden relative group bg-slate-100"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.url}
                              alt={`Arrival photo ${i + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Camera className="w-5 h-5 text-white" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {handoverPhotos.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-amber-400">
                        Collection — Handover
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {handoverPhotos.map((img, i) => (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => openLightbox(handoverPhotos, i)}
                            className="aspect-square rounded-2xl overflow-hidden relative group bg-slate-100"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.url}
                              alt={`Handover photo ${i + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Camera className="w-5 h-5 text-white" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {allPhotos.length > 2 && (
                    <button
                      className="w-full py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 border border-dashed border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600 transition-colors"
                      onClick={() => openLightbox(allPhotos, 0)}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      View all {allPhotos.length} photos
                    </button>
                  )}
                </div>
              )}
            </Card>

            {/* Payment Breakdown */}
            <Card className="p-8">
              <SectionLabel color="text-amber-600">Payment Breakdown</SectionLabel>
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Delivery Fee</span>
                  <span className="font-semibold text-sm text-slate-800">{fmt(parcel.deliveryFee)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Storage Fee</span>
                  <span className="font-semibold text-sm text-slate-800">{fmt(parcel.storageFee)}</span>
                </div>
                <div className="pt-5 flex justify-between items-center border-t border-slate-100">
                  <span className="font-bold text-sm text-slate-800">Total Amount</span>
                  <p className="text-2xl font-extrabold text-amber-600">{fmt(String(total))}</p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <button
                  className="w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                  onClick={() => setShowInvoice(true)}
                >
                  <Receipt className="w-4 h-4" />
                  Generate Invoice
                </button>
              </div>
            </Card>

            {/* Activity Log */}
            <Card className="p-8">
              <SectionLabel color="text-slate-500">Recent Activity</SectionLabel>
              <div className="space-y-6">
                {isCollected && parcel.handover && (
                  <div className="flex gap-4">
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ring-4 ${parcel.handover.overriddenBy ? "bg-red-400 ring-red-100" : "bg-emerald-500 ring-emerald-100"}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        {parcel.handover.overriddenBy
                          ? `Admin override · ${parcel.handover.overriddenBy}`
                          : `Collected & Handed Over${parcel.handover.idVerified ? " · ID Verified" : ""}`}
                      </p>
                      {parcel.handover.note && (
                        <p className="text-[10px] mt-1 text-slate-500 italic">&ldquo;{parcel.handover.note}&rdquo;</p>
                      )}
                      <p className="text-[10px] mt-1 text-slate-400">
                        {new Date(parcel.handover.confirmedAt).toLocaleString("en-NG", {
                          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex gap-4">
                  <div className="mt-1 w-2 h-2 rounded-full shrink-0 bg-violet-500 ring-4 ring-violet-100" />
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      Checked in{parcel.custodian ? ` by ${parcel.custodian.name}` : ""}
                    </p>
                    <p className="text-[10px] mt-1 text-slate-400">
                      {new Date(parcel.createdAt).toLocaleString("en-NG", {
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                {checkInPhotos.length > 0 && (
                  <div className="flex gap-4">
                    <div className="mt-1 w-2 h-2 rounded-full shrink-0 bg-slate-300 ring-4 ring-slate-100" />
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        {checkInPhotos.length} arrival photo{checkInPhotos.length !== 1 ? "s" : ""} captured
                      </p>
                      <p className="text-[10px] mt-1 text-slate-400">At check-in</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

          </div>
        </div>
      </div>

      {/* ── Status Update Modal ── */}
      {showStatusModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => { setShowStatusModal(false); setPendingStatus(null); }}
        >
          <div
            className="bg-white rounded-3xl p-8 w-full max-w-sm mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {pendingStatus === null ? (
              /* ── Step 1: Pick a status ── */
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-800">Override Status</h2>
                  <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-slate-500 mb-6">
                  Current: <strong className="text-slate-700">{isCollected ? "Collected" : "In Store"}</strong>
                </p>
                <div className="space-y-3">
                  <button
                    disabled={!isCollected}
                    onClick={() => setPendingStatus("IN_STORE")}
                    className={`w-full py-3 px-5 rounded-2xl text-sm font-semibold flex items-center justify-between transition-all ${
                      !isCollected
                        ? "bg-violet-50 text-violet-400 border border-violet-200 cursor-default"
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-700"
                    }`}
                  >
                    <span>In Store</span>
                    {!isCollected && <Check className="w-4 h-4" />}
                  </button>
                  <button
                    disabled={isCollected}
                    onClick={() => setPendingStatus("COLLECTED")}
                    className={`w-full py-3 px-5 rounded-2xl text-sm font-semibold flex items-center justify-between transition-all ${
                      isCollected
                        ? "bg-emerald-50 text-emerald-400 border border-emerald-200 cursor-default"
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-emerald-700"
                    }`}
                  >
                    <span>Collected</span>
                    {isCollected && <Check className="w-4 h-4" />}
                  </button>
                </div>
              </>
            ) : (
              /* ── Step 2: Confirm the override ── */
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-800">Confirm Override</h2>
                  <button onClick={() => { setPendingStatus(null); setPaymentNote(""); setOverrideError(""); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-600">
                    {isCollected ? "Collected" : "In Store"}
                  </span>
                  <span className="text-slate-400 text-sm">→</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    pendingStatus === "COLLECTED"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-violet-100 text-violet-700"
                  }`}>
                    {pendingStatus === "COLLECTED" ? "Collected" : "In Store"}
                  </span>
                </div>

                {/* Payment note — required when overriding to COLLECTED */}
                {pendingStatus === "COLLECTED" && (
                  <div className="mb-5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Payment Evidence <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={paymentNote}
                      onChange={(e) => { setPaymentNote(e.target.value); setOverrideError(""); }}
                      placeholder="e.g. Cash received ₦12,500 — receipt #A0042, or POS ref #TX9821"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
                    />
                  </div>
                )}

                <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Manual override</p>
                  <p className="text-xs text-amber-600 leading-relaxed">
                    This bypasses the normal staff workflow. Use only to correct data errors.
                  </p>
                </div>

                {overrideError && (
                  <p className="mb-4 text-xs text-red-600 font-medium">{overrideError}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => { setPendingStatus(null); setPaymentNote(""); setOverrideError(""); }}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={statusUpdating || (pendingStatus === "COLLECTED" && !paymentNote.trim())}
                    onClick={() => updateStatus(pendingStatus!)}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {statusUpdating ? "Updating…" : "Confirm"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Invoice Modal ── */}
      {showInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowInvoice(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800">Invoice</h2>
              <button onClick={() => setShowInvoice(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Batch ID</span>
                <span className="font-mono font-semibold text-slate-700">{parcel.batchId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Item</span>
                <span className="font-semibold text-slate-700">{parcel.itemDescription}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sender</span>
                <span className="font-semibold text-slate-700">{parcel.senderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Receiver</span>
                <span className="font-semibold text-slate-700">{parcel.receiverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Terminal</span>
                <span className="font-semibold text-slate-700">{parcel.terminal?.name ?? "—"}</span>
              </div>
              <hr className="border-slate-100 my-2" />
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Fee</span>
                <span className="font-semibold text-slate-700">{fmt(parcel.deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Storage Fee</span>
                <span className="font-semibold text-slate-700">{fmt(parcel.storageFee)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-100">
                <span className="font-bold text-slate-800">Total</span>
                <span className="font-extrabold text-amber-600 text-lg">{fmt(String(total))}</span>
              </div>
            </div>
            <button
              className="mt-6 w-full py-3 rounded-2xl bg-violet-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-violet-700 transition-colors"
              onClick={() => {
                const win = window.open("", "_blank", "width=500,height=600");
                if (!win) return;
                win.document.write(`<!DOCTYPE html><html><head><title>Invoice – ${parcel.batchId}</title>
<style>body{font-family:sans-serif;padding:32px;color:#111}h1{font-size:22px;margin:0 0 4px}p{margin:2px 0;color:#555}.row{display:flex;justify-content:space-between;margin-bottom:8px}.total{font-size:18px;font-weight:800;color:#d97706}hr{border:none;border-top:1px solid #e2e8f0;margin:12px 0}</style></head>
<body onload="window.print();window.close()">
<h1>Invoice</h1><p style="color:#7c3aed;font-size:12px;margin-bottom:24px">#${parcel.batchId}</p>
<div class="row"><span>Item</span><strong>${parcel.itemDescription}</strong></div>
<div class="row"><span>Sender</span><span>${parcel.senderName}</span></div>
<div class="row"><span>Receiver</span><span>${parcel.receiverName} · ${parcel.receiverPhone}</span></div>
<div class="row"><span>Terminal</span><span>${parcel.terminal?.name ?? "—"}</span></div>
<hr/>
<div class="row"><span>Delivery Fee</span><span>${fmt(parcel.deliveryFee)}</span></div>
<div class="row"><span>Storage Fee</span><span>${fmt(parcel.storageFee)}</span></div>
<hr/>
<div class="row"><strong>Total</strong><span class="total">${fmt(String(total))}</span></div>
</body></html>`);
                win.document.close();
              }}
            >
              <Printer className="w-4 h-4" />
              Print Invoice
            </button>
          </div>
        </div>
      )}

      {/* ── Inline Lightbox Overlay ── */}
      {lbOpen && lbPhotos.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLbOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors hover:bg-white/10"
            onClick={() => setLbOpen(false)}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {lbPhotos.length > 1 && (
            <button
              className="absolute left-5 w-11 h-11 rounded-full flex items-center justify-center text-white transition-colors hover:bg-white/10"
              onClick={(e) => { e.stopPropagation(); lbPrev(); }}
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div className="max-w-3xl max-h-[80vh] px-16" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lbPhotos[lbIndex].url}
              alt={`Photo ${lbIndex + 1}`}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain"
            />
            <p className="text-center text-xs mt-3 text-white/60">
              {lbIndex + 1} / {lbPhotos.length}
            </p>
          </div>

          {lbPhotos.length > 1 && (
            <button
              className="absolute right-5 w-11 h-11 rounded-full flex items-center justify-center text-white transition-colors hover:bg-white/10"
              onClick={(e) => { e.stopPropagation(); lbNext(); }}
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
