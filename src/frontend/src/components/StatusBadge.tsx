import type { Status } from "../types";
import { getStatusKey } from "../types";

interface Props {
  status: Status;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "PENDING", className: "status-pending" },
  approved: { label: "APPROVED", className: "status-approved" },
  rejected: { label: "REJECTED", className: "status-rejected" },
  completed: { label: "COMPLETED", className: "status-completed" },
  notFulfilled: { label: "NOT FULFILLED", className: "status-notfulfilled" },
  received: { label: "RECEIVED", className: "status-received" },
};

export function StatusBadge({ status, className = "" }: Props) {
  const key = getStatusKey(status);
  const config = statusConfig[key] ?? statusConfig.pending;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
