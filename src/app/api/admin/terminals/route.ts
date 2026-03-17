import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const terminals = await prisma.terminal.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true, parcels: true } } },
  });
  return NextResponse.json(terminals);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, location } = await req.json();
  if (!name || !location)
    return NextResponse.json(
      { error: "Name and location are required" },
      { status: 400 }
    );

  const terminal = await prisma.terminal.create({
    data: { name: String(name).trim(), location: String(location).trim() },
  });
  return NextResponse.json(terminal, { status: 201 });
}
