import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const [terminal, inStoreCount, collectedCount, revenue] = await Promise.all([
    prisma.terminal.findUnique({
      where: { id },
      include: {
        users: {
          orderBy: { name: "asc" },
          select: { id: true, name: true, email: true, role: true, createdAt: true },
        },
        parcels: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            batchId: true,
            status: true,
            receiverName: true,
            itemDescription: true,
            createdAt: true,
          },
        },
        _count: { select: { users: true, parcels: true } },
      },
    }),
    prisma.parcel.count({ where: { terminalId: id, status: "IN_STORE" } }),
    prisma.parcel.count({ where: { terminalId: id, status: "COLLECTED" } }),
    prisma.parcel.aggregate({
      where: { terminalId: id, status: "COLLECTED" },
      _sum: { deliveryFee: true, storageFee: true },
    }),
  ]);

  if (!terminal)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const totalRevenue =
    Number(revenue._sum.deliveryFee ?? 0) +
    Number(revenue._sum.storageFee ?? 0);

  return NextResponse.json({ ...terminal, inStoreCount, collectedCount, totalRevenue });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { name, location } = await req.json();

  const terminal = await prisma.terminal.update({
    where: { id },
    data: {
      ...(name && { name: String(name).trim() }),
      ...(location && { location: String(location).trim() }),
    },
  });
  return NextResponse.json(terminal);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  // Unassign users from this terminal before deleting
  await prisma.user.updateMany({
    where: { terminalId: id },
    data: { terminalId: null },
  });

  await prisma.terminal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
