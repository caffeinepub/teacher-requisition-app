import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Check,
  CheckSquare,
  Eye,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";
import type { RequisitionView } from "../types";
import { getPriorityKey, getStatusKey } from "../types";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";

type ActionConfig = {
  type: "view" | "approve" | "reject" | "complete" | "notFulfilled";
  label: string;
  icon: React.ReactNode;
  className: string;
};

interface Props {
  data: RequisitionView[];
  isLoading: boolean;
  showTeacher?: boolean;
  actions?: ("view" | "approve" | "reject" | "complete" | "notFulfilled")[];
  onView?: (req: RequisitionView) => void;
  onApprove?: (req: RequisitionView) => void;
  onReject?: (req: RequisitionView) => void;
  onComplete?: (req: RequisitionView) => void;
  onNotFulfilled?: (req: RequisitionView) => void;
}

const actionDefs: Record<string, ActionConfig> = {
  view: {
    type: "view",
    label: "View",
    icon: <Eye size={14} />,
    className: "text-muted-foreground hover:text-foreground",
  },
  approve: {
    type: "approve",
    label: "Approve",
    icon: <Check size={14} />,
    className: "text-green-600 hover:text-green-700 hover:bg-green-50",
  },
  reject: {
    type: "reject",
    label: "Reject",
    icon: <X size={14} />,
    className: "text-red-600 hover:text-red-700 hover:bg-red-50",
  },
  complete: {
    type: "complete",
    label: "Complete",
    icon: <CheckSquare size={14} />,
    className: "text-blue-600 hover:text-blue-700 hover:bg-blue-50",
  },
  notFulfilled: {
    type: "notFulfilled",
    label: "Not Fulfilled",
    icon: <AlertTriangle size={14} />,
    className: "text-gray-600 hover:text-gray-700 hover:bg-gray-50",
  },
};

export function RequisitionTable({
  data,
  isLoading,
  showTeacher = false,
  actions = ["view"],
  onView,
  onApprove,
  onReject,
  onComplete,
  onNotFulfilled,
}: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filtered = data.filter((r) => {
    const matchSearch =
      search === "" ||
      r.itemName.toLowerCase().includes(search.toLowerCase()) ||
      r.teacherName.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || getStatusKey(r.status) === statusFilter;
    const matchPriority =
      priorityFilter === "all" || getPriorityKey(r.priority) === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  function handleAction(type: string, req: RequisitionView) {
    if (type === "view") onView?.(req);
    if (type === "approve") onApprove?.(req);
    if (type === "reject") onReject?.(req);
    if (type === "complete") onComplete?.(req);
    if (type === "notFulfilled") onNotFulfilled?.(req);
  }

  // base cols: ID, Item, Qty, Category, Location, Priority, Date Needed, Status, Actions = 9
  // +1 if showTeacher
  const colSpan = showTeacher ? 10 : 9;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            data-ocid="table.search_input"
            placeholder="Search by item or teacher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-36 h-8 text-xs bg-white"
            data-ocid="table.status.select"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="notFulfilled">Not Fulfilled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger
            className="w-36 h-8 text-xs bg-white"
            data-ocid="table.priority.select"
          >
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-[10px] border border-border shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F6F8FB] hover:bg-[#F6F8FB]">
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide w-16">
                ID
              </TableHead>
              {showTeacher && (
                <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Teacher
                </TableHead>
              )}
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Item
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide w-20">
                Qty
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide w-28">
                Category
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide w-28">
                Location
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide w-24">
                Priority
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide w-28">
                Date Needed
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide w-32">
                Status
              </TableHead>
              <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow
                  key={`skeleton-${i + 1}`}
                  data-ocid={`table.row.${i + 1}`}
                >
                  <TableCell colSpan={colSpan}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={colSpan}
                  className="text-center py-10"
                  data-ocid="table.empty_state"
                >
                  <p className="text-sm text-muted-foreground">
                    No requisitions found.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((req, idx) => (
                <TableRow
                  key={req.id.toString()}
                  className="border-[#EEF2F7] hover:bg-muted/30 cursor-pointer"
                  data-ocid={`table.row.${idx + 1}`}
                  onClick={() => onView?.(req)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onView?.(req);
                  }}
                  tabIndex={0}
                >
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    #{req.id.toString()}
                  </TableCell>
                  {showTeacher && (
                    <TableCell className="text-xs font-medium">
                      {req.teacherName}
                    </TableCell>
                  )}
                  <TableCell className="text-xs font-medium max-w-[140px] truncate">
                    {req.itemName}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {req.quantity.toString()}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[110px] truncate">
                    {req.category || (
                      <span className="italic opacity-50">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[110px] truncate">
                    {req.location || (
                      <span className="italic opacity-50">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={req.priority} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {req.dateNeeded}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={req.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className="flex items-center justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      {actions.map((a) => {
                        const def = actionDefs[a];
                        return (
                          <Button
                            key={a}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={`h-7 px-2 text-xs gap-1 ${def.className}`}
                            data-ocid={`table.${a}.button.${idx + 1}`}
                            onClick={() => handleAction(a, req)}
                          >
                            {def.icon}
                            {def.label}
                          </Button>
                        );
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {data.length} requisitions
      </p>
    </div>
  );
}
