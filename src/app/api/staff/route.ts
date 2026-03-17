import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// GET /api/staff — list staff members in the same terminal as the logged-in user
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user.terminalId) {
    return NextResponse.json({ error: "No terminal assigned" }, { status: 400 });
  }

  const staff = await prisma.user.findMany({
    where: { terminalId: session.user.terminalId },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(staff);
}
