import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

// ONE-TIME USE — delete this file after seeding
export async function GET() {
  const secret = process.env.SEED_SECRET;
  if (!secret || secret !== "storekeeper-seed-2026") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const hashed = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@storekeeper.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@storekeeper.com",
      password: hashed,
      role: Role.SUPER_ADMIN,
    },
  });

  return NextResponse.json({
    message: "✅ Superadmin ready",
    email: admin.email,
  });
}
