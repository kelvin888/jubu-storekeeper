import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

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
