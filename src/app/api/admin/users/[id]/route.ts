import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { name, email, password, role, terminalId } = await req.json();

  if (role === Role.SUPER_ADMIN)
    return NextResponse.json(
      { error: "Cannot assign Super Admin role" },
      { status: 400 }
    );

  const updateData: Record<string, unknown> = {};
  if (name) updateData.name = String(name).trim();
  if (email) updateData.email = String(email).trim().toLowerCase();
  if (role) updateData.role = role as Role;
  if (terminalId !== undefined) updateData.terminalId = terminalId || null;
  if (password) updateData.password = await bcrypt.hash(String(password), 10);

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      terminalId: true,
    },
  });
  return NextResponse.json(user);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
