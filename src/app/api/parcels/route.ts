import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// Generate next batch ID: SKP-YYYY-XXXX
async function generateBatchId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `SKP-${year}-`;
  const last = await prisma.parcel.findFirst({
    where: { batchId: { startsWith: prefix } },
    orderBy: { batchId: "desc" },
    select: { batchId: true },
  });
  if (!last) return `${prefix}0001`;
  const num = parseInt(last.batchId.split("-")[2] ?? "0", 10);
  return `${prefix}${String(num + 1).padStart(4, "0")}`;
}

// GET /api/parcels — list parcels scoped to session terminal
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const perPage = 10;

  const where = {
    ...(session.user.terminalId ? { terminalId: session.user.terminalId } : {}),
    ...(search
      ? {
          OR: [
            { itemDescription: { contains: search, mode: "insensitive" as const } },
            { receiverName: { contains: search, mode: "insensitive" as const } },
            { batchId: { contains: search, mode: "insensitive" as const } },
            { custodian: { name: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [total, parcels] = await Promise.all([
    prisma.parcel.count({ where }),
    prisma.parcel.findMany({
      where,
      include: {
        custodian: { select: { id: true, name: true } },
        terminal: { select: { id: true, name: true, location: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  return NextResponse.json({ parcels, total, page, perPage });
}

// POST /api/parcels — create a new parcel (check-in)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user.terminalId)
    return NextResponse.json({ error: "No terminal assigned to your account" }, { status: 400 });

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
  } = body;

  if (!itemDescription || !senderName || !receiverName || !receiverPhone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const batchId = await generateBatchId();

  const parcel = await prisma.parcel.create({
    data: {
      batchId,
      itemDescription: String(itemDescription).trim(),
      itemCategory: itemCategory ? String(itemCategory).trim() : null,
      driverName: driverName ? String(driverName).trim() : null,
      vehicleNumber: vehicleNumber ? String(vehicleNumber).trim() : null,
      senderName: String(senderName).trim(),
      receiverName: String(receiverName).trim(),
      receiverPhone: String(receiverPhone).trim(),
      deliveryFee: parseFloat(deliveryFee) || 0,
      storageFee: parseFloat(storageFee) || 0,
      terminalId: session.user.terminalId,
    },
  });

  return NextResponse.json(parcel, { status: 201 });
}
