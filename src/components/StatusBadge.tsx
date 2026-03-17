import { ParcelStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ParcelStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const isInStore = status === ParcelStatus.IN_STORE;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        isInStore
          ? "bg-emerald-100 text-emerald-800"
          : "bg-gray-100 text-gray-600",
        className
      )}
    >
      {isInStore ? "In Store" : "Collected"}
    </span>
  );
}
