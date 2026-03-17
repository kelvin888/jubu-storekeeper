import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    where: { role: { not: Role.SUPER_ADMIN } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      terminalId: true,
      createdAt: true,
      terminal: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, email, password, role, terminalId } = await req.json();

  if (!name || !email || !password || !role)
    return NextResponse.json(
      { error: "name, email, password and role are required" },
      { status: 400 }
    );

  if (role === Role.SUPER_ADMIN)
    return NextResponse.json(
      { error: "Cannot create another Super Admin" },
      { status: 400 }
    );

  const hashed = await bcrypt.hash(String(password), 10);

  try {
    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        password: hashed,
        role: role as Role,
        terminalId: terminalId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        terminalId: true,
        createdAt: true,
      },
    });
    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }
}
