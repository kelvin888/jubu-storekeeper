import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ParcelStatus, Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim() ?? "";
  const terminalId = searchParams.get("terminalId") ?? "";
  const statusParam = searchParams.get("status") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const perPage = 15;

  const where: Prisma.ParcelWhereInput = {
    ...(terminalId ? { terminalId } : {}),
    ...(statusParam === "IN_STORE" || statusParam === "COLLECTED"
      ? { status: statusParam as ParcelStatus }
      : {}),
    ...(q
      ? {
          OR: [
            { batchId: { contains: q, mode: "insensitive" } },
            { itemDescription: { contains: q, mode: "insensitive" } },
            { receiverName: { contains: q, mode: "insensitive" } },
            { receiverPhone: { contains: q, mode: "insensitive" } },
            { senderName: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, parcels] = await Promise.all([
    prisma.parcel.count({ where }),
    prisma.parcel.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        batchId: true,
        itemDescription: true,
        receiverName: true,
        receiverPhone: true,
        status: true,
        createdAt: true,
        terminal: { select: { id: true, name: true } },
        custodian: { select: { id: true, name: true } },
      },
    }),
  ]);

  return NextResponse.json({ parcels, total, page, perPage });
}
