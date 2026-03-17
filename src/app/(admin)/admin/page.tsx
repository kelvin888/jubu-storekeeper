import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Package } from "lucide-react";
import { Role } from "@prisma/client";

export default async function AdminOverviewPage() {
  const [terminalCount, userCount, parcelCount] = await Promise.all([
    prisma.terminal.count(),
    prisma.user.count({ where: { role: { not: Role.SUPER_ADMIN } } }),
    prisma.parcel.count(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage terminals and staff across all locations.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{terminalCount}</p>
              <p className="text-sm text-gray-500">Terminals</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{userCount}</p>
              <p className="text-sm text-gray-500">Staff Members</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{parcelCount}</p>
              <p className="text-sm text-gray-500">Total Parcels</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" />
              Terminals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Create and manage terminal locations. Each terminal is an
              independently operated store point.
            </p>
            <Link href="/admin/terminals">
              <Button className="bg-indigo-600 hover:bg-indigo-700 w-full">
                Manage Terminals
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Create staff accounts, assign roles (Manager / Officer), and link
              them to a terminal.
            </p>
            <Link href="/admin/users">
              <Button className="bg-indigo-600 hover:bg-indigo-700 w-full">
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
