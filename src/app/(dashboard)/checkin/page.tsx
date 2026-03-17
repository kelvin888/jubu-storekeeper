"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const EMPTY = {
  itemDescription: "",
  itemCategory: "",
  driverName: "",
  vehicleNumber: "",
  senderName: "",
  receiverName: "",
  receiverPhone: "",
  deliveryFee: "",
  storageFee: "",
};

export default function CheckInPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function clear() {
    setForm(EMPTY);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/parcels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deliveryFee: parseFloat(form.deliveryFee) || 0,
          storageFee: parseFloat(form.storageFee) || 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to check in parcel");
        return;
      }

      router.push("/inventory");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Parcel Check-in</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter details manually for incoming cargo and luggage.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section 1 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-indigo-600">
              1. Item Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="itemDescription">Item Description</Label>
              <Input
                id="itemDescription"
                placeholder="e.g., Bag of Yam, Large Suitcase, Electronics Box"
                value={form.itemDescription}
                onChange={(e) => set("itemDescription", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="itemCategory">Item Category (optional)</Label>
              <Input
                id="itemCategory"
                placeholder="e.g., Perishable Goods, Electronics, Automotive"
                value={form.itemCategory}
                onChange={(e) => set("itemCategory", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="driverName">Driver Name / Vehicle Number</Label>
              <Input
                id="driverName"
                placeholder="e.g., Musa Abdullahi - MUS-123-XY"
                value={form.driverName}
                onChange={(e) => set("driverName", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-indigo-600">
              2. Sender &amp; Receiver
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="senderName">Sender Name</Label>
                <Input
                  id="senderName"
                  placeholder="Full Name"
                  value={form.senderName}
                  onChange={(e) => set("senderName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="receiverName">Receiver Name</Label>
                <Input
                  id="receiverName"
                  placeholder="Full Name"
                  value={form.receiverName}
                  onChange={(e) => set("receiverName", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="receiverPhone">Receiver Phone Number</Label>
              <Input
                id="receiverPhone"
                placeholder="e.g., 0801 234 5678"
                value={form.receiverPhone}
                onChange={(e) => set("receiverPhone", e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-indigo-600">
              3. Fees (Cash Payment)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="deliveryFee">Agreed Delivery Fee (₦)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    ₦
                  </span>
                  <Input
                    id="deliveryFee"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-7"
                    value={form.deliveryFee}
                    onChange={(e) => set("deliveryFee", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="storageFee">Storage Fee (₦)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    ₦
                  </span>
                  <Input
                    id="storageFee"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-7"
                    value={form.storageFee}
                    onChange={(e) => set("storageFee", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-11 text-base"
          >
            {loading ? "Checking in…" : "Complete Check-in"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clear}
            disabled={loading}
            className="h-11"
          >
            Clear Form
          </Button>
        </div>
      </form>
    </div>
  );
}
