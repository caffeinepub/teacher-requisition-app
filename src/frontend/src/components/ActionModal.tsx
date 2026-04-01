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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export type ActionType = "approve" | "reject" | "complete" | "notFulfilled";

interface Props {
  open: boolean;
  actionType: ActionType | null;
  requisitionId: bigint | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (id: bigint, remarks: string) => void;
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
    description: "Are you sure you want to approve this requisition?",
    remarksLabel: "Remarks (optional)",
    required: false,
    confirmLabel: "Approve",
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
}: Props) {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  const config = actionType ? actionConfig[actionType] : null;

  function handleClose() {
    setRemarks("");
    setError("");
    onClose();
  }

  function handleConfirm() {
    if (!config || requisitionId === null) return;
    if (config.required && !remarks.trim()) {
      setError("This field is required.");
      return;
    }
    setError("");
    onConfirm(requisitionId, remarks);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent data-ocid="action.dialog">
        <DialogHeader>
          <DialogTitle>{config?.title}</DialogTitle>
          <DialogDescription>{config?.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
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
            disabled={isPending}
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
