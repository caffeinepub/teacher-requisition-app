export type AppRole =
  | { teacher: null }
  | { authority: null }
  | { adminStaff: null }
  | { superAdmin: null };

export type Priority =
  | { low: null }
  | { medium: null }
  | { high: null }
  | { urgent: null };

export type Status =
  | { pending: null }
  | { approved: null }
  | { rejected: null }
  | { completed: null }
  | { notFulfilled: null };

export interface HistoryEntry {
  actorEmail: string;
  actorName: string;
  timestamp: bigint;
  status: Status;
  remarks: [] | [string];
}

export interface RequisitionView {
  id: bigint;
  itemName: string;
  description: string;
  quantity: bigint;
  priority: Priority;
  dateNeeded: string;
  teacherEmail: string;
  teacherName: string;
  createdAt: bigint;
  status: Status;
  history: HistoryEntry[];
  category: string;
  location: string;
}

export interface UserView {
  email: string;
  name: string;
  role: AppRole;
}

export function getRoleName(role: AppRole): string {
  if ("teacher" in role) return "Teacher";
  if ("authority" in role) return "Authority";
  if ("adminStaff" in role) return "Admin Staff";
  if ("superAdmin" in role) return "Super Admin";
  return "Unknown";
}

export function getStatusKey(status: Status): string {
  if ("pending" in status) return "pending";
  if ("approved" in status) return "approved";
  if ("rejected" in status) return "rejected";
  if ("completed" in status) return "completed";
  if ("notFulfilled" in status) return "notFulfilled";
  return "pending";
}

export function getPriorityKey(priority: Priority): string {
  if ("low" in priority) return "low";
  if ("medium" in priority) return "medium";
  if ("high" in priority) return "high";
  if ("urgent" in priority) return "urgent";
  return "low";
}

export function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
