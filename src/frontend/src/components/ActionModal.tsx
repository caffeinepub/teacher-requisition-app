import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UserCog } from "lucide-react";
import { useState } from "react";
import type { AdminStaffView } from "../types";

export type ActionType = "approve" | "reject" | "complete" | "notFulfilled";

interface Props {
  open: boolean;
  actionType: ActionType | null;
  requisitionId: bigint | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (id: bigint, remarks: string, adminStaffEmail?: string) => void;
  adminStaff?: AdminStaffView[];
  currentAssignedAdminStaff?: string | null;
}

const actionConfig: Record<
  ActionType,
  {
    title: string;
    description: string;
    remarksLabel: string;
    required: boolean;
    confirmLabel: string;
    confirmClass: string;
  }
> = {
  approve: {
    title: "Approve Requisition",
    description: "Assign an admin staff member and approve this requisition.",
    remarksLabel: "Remarks (optional)",
    required: false,
    confirmLabel: "Assign & Approve",
    confirmClass: "bg-green-600 hover:bg-green-700 text-white",
  },
  reject: {
    title: "Reject Requisition",
    description: "Please provide a reason for rejection.",
    remarksLabel: "Remarks (optional)",
    required: false,
    confirmLabel: "Reject",
    confirmClass: "bg-red-600 hover:bg-red-700 text-white",
  },
  complete: {
    title: "Mark as Completed",
    description: "Confirm that this requisition has been fulfilled.",
    remarksLabel: "Remarks",
    required: true,
    confirmLabel: "Mark Complete",
    confirmClass: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  notFulfilled: {
    title: "Mark as Not Fulfilled",
    description: "Explain why this requisition could not be completed.",
    remarksLabel: "Reason (required)",
    required: true,
    confirmLabel: "Mark Not Fulfilled",
    confirmClass: "bg-gray-600 hover:bg-gray-700 text-white",
  },
};

export function ActionModal({
  open,
  actionType,
  requisitionId,
  isPending,
  onClose,
  onConfirm,
  adminStaff,
  currentAssignedAdminStaff,
}: Props) {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [selectedAdminStaff, setSelectedAdminStaff] = useState("");

  const config = actionType ? actionConfig[actionType] : null;
  const isApprove = actionType === "approve";
  const showStaffSelect = isApprove && adminStaff !== undefined;

  function handleClose() {
    setRemarks("");
    setError("");
    setSelectedAdminStaff("");
    onClose();
  }

  function handleConfirm() {
    if (!config || requisitionId === null) return;
    if (config.required && !remarks.trim()) {
      setError("This field is required.");
      return;
    }
    if (showStaffSelect && !selectedAdminStaff) {
      setError("Please select an admin staff member before approving.");
      return;
    }
    setError("");
    onConfirm(
      requisitionId,
      remarks,
      isApprove ? selectedAdminStaff : undefined,
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent data-ocid="action.dialog">
        <DialogHeader>
          <DialogTitle>{config?.title}</DialogTitle>
          <DialogDescription>{config?.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {showStaffSelect && (
            <div>
              <Label className="text-xs font-semibold">
                Assign Admin Staff <span className="text-destructive">*</span>
              </Label>
              {currentAssignedAdminStaff && (
                <p className="text-[11px] text-purple-600 mt-0.5 mb-1">
                  Currently assigned:{" "}
                  <span className="font-semibold">
                    {currentAssignedAdminStaff}
                  </span>
                </p>
              )}
              {adminStaff && adminStaff.length === 0 ? (
                <p className="text-sm text-muted-foreground mt-1 bg-muted/40 rounded-lg p-3 italic">
                  No admin staff found. Create them in the Super Admin panel.
                </p>
              ) : (
                <Select
                  value={selectedAdminStaff}
                  onValueChange={setSelectedAdminStaff}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="action.assign_staff.select"
                  >
                    <SelectValue placeholder="Choose an admin staff member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {adminStaff?.map((staff) => (
                      <SelectItem key={staff.email} value={staff.email}>
                        <span className="flex items-center gap-2">
                          <UserCog size={13} className="text-purple-500" />
                          {staff.name} ({staff.email})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
          <div>
            <Label htmlFor="action-remarks" className="text-xs font-medium">
              {config?.remarksLabel}
              {config?.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Textarea
              id="action-remarks"
              data-ocid="action.textarea"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter your remarks here..."
              rows={3}
              className="mt-1 text-sm"
            />
            {error && (
              <p
                className="text-xs text-destructive mt-1"
                data-ocid="action.error_state"
              >
                {error}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
            data-ocid="action.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              isPending ||
              (showStaffSelect && (!adminStaff || adminStaff.length === 0))
            }
            className={config?.confirmClass}
            data-ocid="action.confirm_button"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {config?.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
