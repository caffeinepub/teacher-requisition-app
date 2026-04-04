import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  Package,
  Paperclip,
  Shield,
  XCircle,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import type { Backend } from "../backend";
import { useActor } from "../hooks/useActor";
import type { RequisitionView } from "../types";
import { formatTimestamp, getStatusKey } from "../types";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";

interface Props {
  requisition: RequisitionView | null;
  open: boolean;
  onClose: () => void;
}

function StatusIcon({ statusKey }: { statusKey: string }): ReactNode {
  const icons: Record<string, ReactNode> = {
    pending: <Clock size={14} className="text-yellow-600" />,
    approved: <CheckCircle2 size={14} className="text-green-600" />,
    rejected: <XCircle size={14} className="text-red-600" />,
    completed: <CheckCircle2 size={14} className="text-blue-600" />,
    notFulfilled: <AlertCircle size={14} className="text-gray-500" />,
  };
  return icons[statusKey] ?? <Clock size={14} />;
}

export function RequisitionModal({ requisition, open, onClose }: Props) {
  const { actor } = useActor();
  const [isLoadingAttachment, setIsLoadingAttachment] = useState(false);

  if (!requisition) return null;

  async function handleViewAttachment() {
    if (!requisition || requisition.attachmentHash.length === 0 || !actor)
      return;
    setIsLoadingAttachment(true);
    try {
      const backend = actor as any as Backend;
      const downloadFile = backend.getDownloadFile();
      const hashBytes = new TextEncoder().encode(requisition.attachmentHash[0]);
      const externalBlob = await downloadFile(hashBytes);
      const url = externalBlob.getDirectURL();
      window.open(url, "_blank");
    } catch {
      // silently ignore
    } finally {
      setIsLoadingAttachment(false);
    }
  }

  const hasAttachment = requisition.attachmentHash.length > 0;
  const assignedAuthorityEmail =
    requisition.assignedAuthorityEmail.length > 0
      ? requisition.assignedAuthorityEmail[0]
      : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg" data-ocid="requisition.modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package size={18} className="text-primary" />
            Requisition #{requisition.id.toString()}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Item Name
                </p>
                <p className="text-sm font-medium text-foreground">
                  {requisition.itemName}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Quantity
                </p>
                <p className="text-sm font-medium text-foreground">
                  {requisition.quantity.toString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Priority
                </p>
                <PriorityBadge priority={requisition.priority} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Status
                </p>
                <StatusBadge status={requisition.status} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Date Needed
                </p>
                <p className="text-sm text-foreground">
                  {requisition.dateNeeded}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Teacher
                </p>
                <p className="text-sm text-foreground">
                  {requisition.teacherName}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                  <Shield size={10} className="text-indigo-500" />
                  Assigned Authority
                </p>
                {assignedAuthorityEmail ? (
                  <p className="text-sm text-foreground flex items-center gap-1.5">
                    <Shield
                      size={12}
                      className="text-indigo-500 flex-shrink-0"
                    />
                    {assignedAuthorityEmail}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Not specified
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Description
              </p>
              <p className="text-sm text-foreground bg-muted/40 rounded-lg p-3">
                {requisition.description}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Submitted
              </p>
              <p className="text-sm text-foreground">
                {formatTimestamp(requisition.createdAt)}
              </p>
            </div>

            {hasAttachment && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Attachment
                </p>
                <button
                  type="button"
                  onClick={handleViewAttachment}
                  disabled={isLoadingAttachment}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 hover:border-indigo-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  data-ocid="requisition.attachment.button"
                >
                  {isLoadingAttachment ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Paperclip size={13} />
                  )}
                  {isLoadingAttachment ? "Opening..." : "View Attachment"}
                  {!isLoadingAttachment && (
                    <ExternalLink size={11} className="opacity-60" />
                  )}
                </button>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <FileText size={11} className="text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">
                    PDF document attached
                  </span>
                </div>
              </div>
            )}

            <Separator />

            <div>
              <p className="text-xs font-semibold text-foreground mb-3">
                Audit Trail
              </p>
              {requisition.history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No history yet.</p>
              ) : (
                <div className="space-y-3">
                  {requisition.history.map((entry, i) => {
                    const statusKey = getStatusKey(entry.status);
                    const remark =
                      entry.remarks.length > 0 ? entry.remarks[0] : null;
                    return (
                      <div
                        key={`${statusKey}-${i + 1}`}
                        className="flex gap-3"
                        data-ocid={`history.item.${i + 1}`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          <StatusIcon statusKey={statusKey} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge status={entry.status} />
                            <span className="text-xs text-muted-foreground">
                              by {entry.actorName}
                            </span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {formatTimestamp(entry.timestamp)}
                            </span>
                          </div>
                          {remark && (
                            <p className="text-xs text-foreground mt-1 bg-muted/40 rounded p-2">
                              {remark}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
