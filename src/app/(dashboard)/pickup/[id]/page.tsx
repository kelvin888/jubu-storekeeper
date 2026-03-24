"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle2, Package, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { SignaturePad, type SignaturePadHandle } from "@/components/SignaturePad";
import { CameraCapture } from "@/components/CameraCapture";
import { ParcelStatus } from "@prisma/client";

async function uploadImages(images: string[], folder: "checkin" | "handover") {
  return Promise.all(
    images.map((data) =>
      fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, folder }),
      }).then((r) => r.json() as Promise<{ url: string; publicId: string }>)
    )
  );
}

interface Parcel {
  id: string;
  batchId: string;
  itemDescription: string;
  itemCategory: string | null;
  receiverName: string;
  receiverPhone: string;
  senderName: string;
  deliveryFee: string;
  storageFee: string;
  status: ParcelStatus;
  terminal: { name: string; location: string } | null;
}

interface CollectedState {
  receiverName: string;
  confirmedAt: string;
  batchId: string;
  itemDescription: string;
  terminalName: string;
  deliveryFee: number;
  storageFee: number;
  idVerified: boolean;
}

export default function PickupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const signatureRef = useRef<SignaturePadHandle>(null);

  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [loading, setLoading] = useState(true);
  const [idVerified, setIdVerified] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [collected, setCollected] = useState<CollectedState | null>(null);

  useEffect(() => {
    fetch(`/api/parcels/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setParcel(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleConfirm() {
    if (photos.length === 0) {
      setError("Please take at least one evidence photo before confirming.");
      return;
    }
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      setError("Please have the receiver sign before confirming.");
      return;
    }

    const signature = signatureRef.current.toDataURL();
    setConfirming(true);
    setError("");

    try {
      // Upload handover photos to Cloudinary
      const uploaded = await uploadImages(photos, "handover");
      const imageUrls = uploaded.map((u) => ({ url: u.url, publicId: u.publicId }));

      const res = await fetch(`/api/parcels/${id}/handover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature, idVerified, imageUrls }),
      });

      if (res.ok) {
        setCollected({
          receiverName: parcel!.receiverName,
          confirmedAt: new Date().toISOString(),
          batchId: parcel!.batchId,
          itemDescription: parcel!.itemDescription,
          terminalName: parcel!.terminal?.name ?? "",
          deliveryFee: parseFloat(parcel!.deliveryFee) || 0,
          storageFee: parseFloat(parcel!.storageFee) || 0,
          idVerified,
        });
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to confirm handover");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setConfirming(false);
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

  if (collected) {
    const fmtFee = (n: number) =>
      "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2 });
    const totalFee = collected.deliveryFee + collected.storageFee;

    return (
      <>
        {/* Print styles */}
        <style>{`
          @media print {
            body * { visibility: hidden !important; }
            #receipt, #receipt * { visibility: visible !important; }
            #receipt { position: fixed; top: 0; left: 0; width: 100%; padding: 24px; }
            .no-print { display: none !important; }
          }
        `}</style>

        <div className="max-w-lg mx-auto text-center py-12 no-print">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-5">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Package Collected!</h2>
          <p className="text-gray-500 text-sm mb-1">
            Handed over to{" "}
            <span className="font-semibold text-gray-700">{collected.receiverName}</span>
          </p>
          <p className="text-gray-400 text-xs mb-8">
            {new Date(collected.confirmedAt).toLocaleString("en-NG")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/inventory">
              <Button variant="outline" className="w-full sm:w-auto">
                Back to Inventory
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
            <Link href="/checkin">
              <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
                <Package className="w-4 h-4 mr-2" />
                New Check-in
              </Button>
            </Link>
          </div>
        </div>

        {/* Print-only receipt */}
        <div id="receipt" className="hidden print:block text-sm text-gray-800 font-sans">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold">StoreKeeper Pro</h1>
            {collected.terminalName && (
              <p className="text-gray-500">{collected.terminalName}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">PICKUP RECEIPT</p>
          </div>
          <div className="border-t border-b border-gray-300 py-4 mb-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Batch ID</span>
              <span className="font-mono font-semibold">{collected.batchId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Item</span>
              <span className="font-semibold">{collected.itemDescription}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Receiver</span>
              <span className="font-semibold">{collected.receiverName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">ID Verified</span>
              <span className="font-semibold">{collected.idVerified ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Collected At</span>
              <span className="font-semibold">
                {new Date(collected.confirmedAt).toLocaleString("en-NG")}
              </span>
            </div>
          </div>
          <div className="space-y-1 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>{fmtFee(collected.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Storage Fee</span>
              <span>{fmtFee(collected.storageFee)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-gray-300 pt-2 mt-2">
              <span>Total Paid</span>
              <span>{fmtFee(totalFee)}</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            Thank you for using StoreKeeper Pro
          </p>
        </div>
      </>
    );
  }

  if (parcel.status === ParcelStatus.COLLECTED) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-1">Already Collected</h2>
        <p className="text-gray-500 text-sm mb-6">
          This parcel has already been handed over.
        </p>
        <Link href={`/inventory/${id}`}>
          <Button variant="outline">View History</Button>
        </Link>
      </div>
    );
  }

  const delivery = parseFloat(parcel.deliveryFee) || 0;
  const storage = parseFloat(parcel.storageFee) || 0;
  const total = delivery + storage;

  const fmt = (n: number) =>
    "₦ " + n.toLocaleString("en-NG", { minimumFractionDigits: 2 });

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href={`/inventory/${parcel.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Parcel
      </Link>

      {/* Pickup Items */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pickup Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-600 text-lg">📦</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{parcel.itemDescription}</p>
              <p className="text-xs text-gray-500 mt-0.5">Batch ID: #{parcel.batchId}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {parcel.itemCategory && (
                  <span className="inline-flex items-center border border-emerald-300 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {parcel.itemCategory}
                  </span>
                )}
                {parcel.terminal?.name && (
                  <span className="inline-flex items-center border border-gray-300 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {parcel.terminal.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receiver Identity */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Receiver Identity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Name</p>
              <p className="font-semibold text-gray-900">{parcel.receiverName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Phone</p>
              <p className="font-semibold text-gray-900 font-mono">{parcel.receiverPhone}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-2.5 py-1.5">
            Verbally confirm the receiver&apos;s name and phone number before proceeding.
          </p>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cash Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="text-gray-900">{fmt(delivery)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Storage Fee</span>
              <span className="text-gray-900">{fmt(storage)}</span>
            </div>
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total Cash to Pay</span>
            <span className="text-2xl font-bold text-indigo-600">{fmt(total)}</span>
          </div>

          {/* Warning */}
          <div className="mt-4 flex gap-2.5 bg-amber-50 border border-amber-200 rounded-md px-3 py-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-snug">
              <strong>Manual Action Required:</strong> Please collect exact cash before
              proceeding. Terminal does not process card/transfer for this shipment.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Collection Evidence Photos */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Collection Evidence <span className="text-red-500 text-sm font-normal">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">
            Take up to 3 photos as proof that the receiver collected the parcel in person.
          </p>
          <CameraCapture images={photos} onChange={setPhotos} max={3} />
          {photos.length === 0 && (
            <p className="text-xs text-red-500">At least one photo is required to confirm handover.</p>
          )}
        </CardContent>
      </Card>

      {/* Receiver Confirmation */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Receiver Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-700">
              Receiver Signature / Mark
            </p>
            <SignaturePad ref={signatureRef} />
          </div>

          <div className="flex items-center gap-2.5">
            <Checkbox
              id="idVerified"
              checked={idVerified}
              onCheckedChange={(v) => setIdVerified(Boolean(v))}
            />
            <label
              htmlFor="idVerified"
              className="text-sm text-gray-700 cursor-pointer select-none"
            >
              I have verified the Receiver&apos;s Government ID
            </label>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <Button
        onClick={handleConfirm}
        disabled={confirming || photos.length === 0}
        className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-semibold"
      >
        <CheckCircle2 className="w-5 h-5 mr-2" />
        {confirming ? "Uploading & Confirming…" : "Confirm Cash Received & Handover"}
      </Button>

      <p className="text-center text-xs text-gray-400 mt-3">
        Handover cannot be undone once confirmed.
      </p>
    </div>
  );
}
