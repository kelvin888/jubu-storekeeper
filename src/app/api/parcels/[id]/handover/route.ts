import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ParcelStatus } from "@prisma/client";

// POST /api/parcels/[id]/handover
export async function POST(
  req: NextRequest,
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
  });

  if (!parcel) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (parcel.status === ParcelStatus.COLLECTED) {
    return NextResponse.json({ error: "Parcel already collected" }, { status: 409 });
  }

  const body = await req.json();
  const { signature, idVerified } = body;

  if (!signature) {
    return NextResponse.json({ error: "Signature is required" }, { status: 400 });
  }

  const [updatedParcel] = await prisma.$transaction([
    prisma.parcel.update({
      where: { id },
      data: { status: ParcelStatus.COLLECTED },
    }),
    prisma.handover.create({
      data: {
        parcelId: id,
        signature: String(signature),
        idVerified: Boolean(idVerified),
      },
    }),
  ]);

  return NextResponse.json(updatedParcel);
}
