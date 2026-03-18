import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ParcelStatus } from "@prisma/client";

export async function GET() {
  const session = await auth();
  if (!session?.user?.terminalId)
    return NextResponse.json({ error: "No terminal assigned" }, { status: 403 });

  const terminalId = session.user.terminalId;
  const userId = session.user.id;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    checkedInToday,
    collectedToday,
    inStoreTotal,
    myCustody,
    recentParcels,
  ] = await Promise.all([
    prisma.parcel.count({
      where: { terminalId, createdAt: { gte: todayStart } },
    }),
    prisma.handover.count({
      where: {
        parcel: { terminalId },
        confirmedAt: { gte: todayStart },
      },
    }),
    prisma.parcel.count({
      where: { terminalId, status: ParcelStatus.IN_STORE },
    }),
    prisma.parcel.count({
      where: { terminalId, custodianId: userId, status: ParcelStatus.IN_STORE },
    }),
    prisma.parcel.findMany({
      where: { terminalId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        batchId: true,
        itemDescription: true,
        status: true,
        receiverName: true,
        updatedAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    checkedInToday,
    collectedToday,
    inStoreTotal,
    myCustody,
    recentParcels,
  });
}
