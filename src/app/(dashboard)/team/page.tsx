"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function TeamPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/staff")
      .then((r) => r.json())
      .then((data) => {
        setStaff(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const roleLabel = (r: string) =>
    r === "TERMINAL_MANAGER" ? "Manager" : "Officer";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <p className="text-sm text-gray-500 mt-1">
          Staff assigned to your terminal.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Name
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Email
              </TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Role
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12 text-gray-400">
                  Loading…
                </TableCell>
              </TableRow>
            ) : staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12 text-gray-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No staff found for this terminal.
                </TableCell>
              </TableRow>
            ) : (
              staff.map((u) => (
                <TableRow key={u.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    {u.name}
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        u.role === "TERMINAL_MANAGER" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {roleLabel(u.role)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
