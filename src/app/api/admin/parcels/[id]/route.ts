import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// GET /api/admin/parcels/[id] — full parcel detail, SUPER_ADMIN only, no terminal scoping
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const parcel = await prisma.parcel.findUnique({
    where: { id },
    include: {
      terminal: { select: { id: true, name: true, location: true } },
      custodian: { select: { id: true, name: true, email: true } },
      handover: true,
      images: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!parcel) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(parcel);
}
