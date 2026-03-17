import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// GET /api/parcels/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const parcel = await prisma.parcel.findFirst({
    where: {
      id,
      ...(session.user.terminalId ? { terminalId: session.user.terminalId } : {}),
    },
    include: {
      custodian: { select: { id: true, name: true, email: true } },
      terminal: { select: { id: true, name: true, location: true } },
      handover: true,
    },
  });

  if (!parcel) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(parcel);
}

// PATCH /api/parcels/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.parcel.findFirst({
    where: {
      id,
      ...(session.user.terminalId ? { terminalId: session.user.terminalId } : {}),
    },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const {
    itemDescription,
    itemCategory,
    driverName,
    vehicleNumber,
    senderName,
    receiverName,
    receiverPhone,
    deliveryFee,
    storageFee,
    custodianId,
  } = body;

  const updated = await prisma.parcel.update({
    where: { id },
    data: {
      ...(itemDescription !== undefined && { itemDescription: String(itemDescription).trim() }),
      ...(itemCategory !== undefined && { itemCategory: itemCategory ? String(itemCategory).trim() : null }),
      ...(driverName !== undefined && { driverName: driverName ? String(driverName).trim() : null }),
      ...(vehicleNumber !== undefined && { vehicleNumber: vehicleNumber ? String(vehicleNumber).trim() : null }),
      ...(senderName !== undefined && { senderName: String(senderName).trim() }),
      ...(receiverName !== undefined && { receiverName: String(receiverName).trim() }),
      ...(receiverPhone !== undefined && { receiverPhone: String(receiverPhone).trim() }),
      ...(deliveryFee !== undefined && { deliveryFee: parseFloat(deliveryFee) || 0 }),
      ...(storageFee !== undefined && { storageFee: parseFloat(storageFee) || 0 }),
      ...(custodianId !== undefined && { custodianId: custodianId || null }),
    },
    include: {
      custodian: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(updated);
}
