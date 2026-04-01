import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  FlaskConical,
  Laptop,
  Loader2,
  Package,
  PlusCircle,
  ShieldAlert,
  Sparkles,
  Trash2,
  Wrench,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ActionModal } from "../components/ActionModal";
import type { ActionType } from "../components/ActionModal";
import { Layout } from "../components/Layout";
import { RequisitionModal } from "../components/RequisitionModal";
import { RequisitionTable } from "../components/RequisitionTable";
import {
  useApproveRequisition,
  useGetAllRequisitions,
  useGetPendingRequisitions,
  useRejectRequisition,
  useSubmitRequisition,
} from "../hooks/useQueries";
import type { SessionData } from "../hooks/useSession";
import type { Priority, RequisitionView } from "../types";

interface Props {
  session: SessionData;
  onLogout: () => void;
}

const PRIORITY_MAP: Record<string, Priority> = {
  low: { low: null },
  medium: { medium: null },
  high: { high: null },
  urgent: { urgent: null },
};

const CATEGORIES = [
  {
    value: "Maintenance",
    label: "Maintenance",
    icon: Wrench,
    color: "text-orange-500",
  },
  {
    value: "Lab Equipment",
    label: "Lab Equipment",
    icon: FlaskConical,
    color: "text-purple-500",
  },
  {
    value: "Stationery",
    label: "Stationery",
    icon: Package,
    color: "text-blue-500",
  },
  {
    value: "IT Equipment",
    label: "IT Equipment",
    icon: Laptop,
    color: "text-indigo-500",
  },
  {
    value: "Cleaning",
    label: "Cleaning",
    icon: Sparkles,
    color: "text-teal-500",
  },
  { value: "Other", label: "Other", icon: Flame, color: "text-gray-500" },
];

export function AuthorityDashboard({ session, onLogout }: Props) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [selectedReq, setSelectedReq] = useState<RequisitionView | null>(null);
  const [actionReq, setActionReq] = useState<RequisitionView | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [form, setForm] = useState({
    itemName: "",
    category: "",
    location: "",
    description: "",
    quantity: "1",
    priority: "medium",
    dateNeeded: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: pending = [], isLoading: loadingPending } =
    useGetPendingRequisitions(session.sessionId);
  const { data: all = [], isLoading: loadingAll } = useGetAllRequisitions(
    session.sessionId,
  );
  const { mutateAsync: approve, isPending: isApproving } =
    useApproveRequisition(session.sessionId);
  const { mutateAsync: reject, isPending: isRejecting } = useRejectRequisition(
    session.sessionId,
  );
  const { mutateAsync: submitRequisition, isPending: isSubmitting } =
    useSubmitRequisition(session.sessionId);

  function openAction(type: ActionType, req: RequisitionView) {
    setActionReq(req);
    setActionType(type);
  }

  async function handleAction(id: bigint, remarks: string) {
    try {
      if (actionType === "approve") {
        await approve({ id, remarks });
        toast.success("Requisition approved.");
      } else if (actionType === "reject") {
        await reject({ id, remarks });
        toast.success("Requisition rejected.");
      }
      setActionReq(null);
      setActionType(null);
    } catch {
      toast.error("Action failed. Please try again.");
    }
  }

  function validateForm() {
    const errors: Record<string, string> = {};
    if (!form.itemName.trim()) errors.itemName = "Item name is required.";
    if (!form.category) errors.category = "Category is required.";
    if (!form.location.trim()) errors.location = "Location is required.";
    if (!form.description.trim())
      errors.description = "Description is required.";
    const qty = Number.parseInt(form.quantity);
    if (Number.isNaN(qty) || qty < 1)
      errors.quantity = "Quantity must be at least 1.";
    if (!form.dateNeeded) errors.dateNeeded = "Date needed is required.";
    return errors;
  }

  async function handleSubmit() {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    try {
      await submitRequisition({
        itemName: form.itemName.trim(),
        description: form.description.trim(),
        quantity: BigInt(Number.parseInt(form.quantity)),
        priority: PRIORITY_MAP[form.priority],
        dateNeeded: form.dateNeeded,
        category: form.category,
        location: form.location,
      });
      toast.success("Requisition submitted successfully!");
      setForm({
        itemName: "",
        category: "",
        location: "",
        description: "",
        quantity: "1",
        priority: "medium",
        dateNeeded: "",
      });
      setActiveNav("all");
    } catch {
      toast.error("Failed to submit requisition.");
    }
  }

  const totalPending = pending.length;
  const totalApproved = all.filter((r) => "approved" in r.status).length;
  const totalRejected = all.filter((r) => "rejected" in r.status).length;

  return (
    <Layout
      session={session}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      onLogout={onLogout}
    >
      {activeNav === "dashboard" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-display">
                Authority Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Review and manage requisition requests
              </p>
            </div>
            <Button
              className="sidebar-gradient text-white hover:opacity-90 gap-2"
              onClick={() => setActiveNav("new")}
              data-ocid="authority.new_requisition.primary_button"
            >
              <PlusCircle size={16} />
              New Requisition
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Pending Review",
                value: totalPending,
                icon: <Clock size={20} />,
                iconBg: "bg-amber-100",
                iconColor: "text-amber-600",
                borderColor: "border-l-amber-500",
                textColor: "text-amber-700",
              },
              {
                label: "Approved",
                value: totalApproved,
                icon: <CheckCircle2 size={20} />,
                iconBg: "bg-emerald-100",
                iconColor: "text-emerald-600",
                borderColor: "border-l-emerald-500",
                textColor: "text-emerald-700",
              },
              {
                label: "Rejected",
                value: totalRejected,
                icon: <XCircle size={20} />,
                iconBg: "bg-red-100",
                iconColor: "text-red-500",
                borderColor: "border-l-red-400",
                textColor: "text-red-600",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`bg-white rounded-xl border border-border border-l-4 ${s.borderColor} shadow-card p-4 flex items-center gap-4`}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${s.iconBg} flex items-center justify-center flex-shrink-0`}
                >
                  <span className={s.iconColor}>{s.icon}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                    {s.label}
                  </p>
                  <p className={`text-3xl font-bold ${s.textColor}`}>
                    {s.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground mb-3">
              Pending Requisitions
            </h2>
            <RequisitionTable
              data={pending.slice(0, 5)}
              isLoading={loadingPending}
              showTeacher
              actions={["view", "approve", "reject"]}
              onView={setSelectedReq}
              onApprove={(r) => openAction("approve", r)}
              onReject={(r) => openAction("reject", r)}
            />
          </div>
        </div>
      )}

      {(activeNav === "pending" || activeNav === "all") && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            {activeNav === "pending"
              ? "Pending Requisitions"
              : "All Requisitions"}
          </h1>
          <Tabs
            value={activeNav}
            onValueChange={setActiveNav}
            data-ocid="authority.tabs"
          >
            <TabsList className="bg-white border border-border">
              <TabsTrigger value="pending" data-ocid="authority.pending.tab">
                Pending ({pending.length})
              </TabsTrigger>
              <TabsTrigger value="all" data-ocid="authority.all.tab">
                All ({all.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4">
              <RequisitionTable
                data={pending}
                isLoading={loadingPending}
                showTeacher
                actions={["view", "approve", "reject"]}
                onView={setSelectedReq}
                onApprove={(r) => openAction("approve", r)}
                onReject={(r) => openAction("reject", r)}
              />
            </TabsContent>
            <TabsContent value="all" className="mt-4">
              <RequisitionTable
                data={all}
                isLoading={loadingAll}
                showTeacher
                actions={["view"]}
                onView={setSelectedReq}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {activeNav === "new" && (
        <div className="max-w-2xl space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              New Requisition
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Fill in the details for your resource request
            </p>
          </div>
          <div className="bg-white rounded-[10px] border border-border shadow-card p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label
                  htmlFor="auth-itemName"
                  className="text-xs font-semibold"
                >
                  Item Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="auth-itemName"
                  data-ocid="auth_new_req.item_name.input"
                  placeholder="e.g. Whiteboard Markers"
                  value={form.itemName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, itemName: e.target.value }))
                  }
                  className="mt-1"
                />
                {formErrors.itemName && (
                  <p
                    className="text-xs text-destructive mt-1"
                    data-ocid="auth_new_req.item_name_error"
                  >
                    {formErrors.itemName}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <Label
                  htmlFor="auth-category"
                  className="text-xs font-semibold"
                >
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
                >
                  <SelectTrigger
                    id="auth-category"
                    className="mt-1"
                    data-ocid="auth_new_req.category.select"
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <SelectItem key={cat.value} value={cat.value}>
                          <span className="flex items-center gap-2">
                            <Icon size={14} className={cat.color} />
                            {cat.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {formErrors.category && (
                  <p
                    className="text-xs text-destructive mt-1"
                    data-ocid="auth_new_req.category_error"
                  >
                    {formErrors.category}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <Label
                  htmlFor="auth-location"
                  className="text-xs font-semibold"
                >
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="auth-location"
                  data-ocid="auth_new_req.location.input"
                  placeholder="e.g. Room 12, Science Block"
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                  className="mt-1"
                />
                {formErrors.location && (
                  <p
                    className="text-xs text-destructive mt-1"
                    data-ocid="auth_new_req.location_error"
                  >
                    {formErrors.location}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <Label
                  htmlFor="auth-description"
                  className="text-xs font-semibold"
                >
                  Description / Purpose{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="auth-description"
                  data-ocid="auth_new_req.description.textarea"
                  placeholder="Describe the purpose and reason for this requisition..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                  className="mt-1 text-sm"
                />
                {formErrors.description && (
                  <p
                    className="text-xs text-destructive mt-1"
                    data-ocid="auth_new_req.description_error"
                  >
                    {formErrors.description}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="auth-quantity"
                  className="text-xs font-semibold"
                >
                  Quantity <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="auth-quantity"
                  type="number"
                  min="1"
                  data-ocid="auth_new_req.quantity.input"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, quantity: e.target.value }))
                  }
                  className="mt-1"
                />
                {formErrors.quantity && (
                  <p
                    className="text-xs text-destructive mt-1"
                    data-ocid="auth_new_req.quantity_error"
                  >
                    {formErrors.quantity}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="auth-priority"
                  className="text-xs font-semibold"
                >
                  Priority
                </Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((p) => ({ ...p, priority: v }))}
                >
                  <SelectTrigger
                    id="auth-priority"
                    className="mt-1"
                    data-ocid="auth_new_req.priority.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <span className="flex items-center gap-2">
                        <Trash2 size={14} className="text-green-500" />
                        Low
                      </span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="flex items-center gap-2">
                        <AlertTriangle size={14} className="text-blue-500" />
                        Medium
                      </span>
                    </SelectItem>
                    <SelectItem value="high">
                      <span className="flex items-center gap-2">
                        <Flame size={14} className="text-orange-500" />
                        High
                      </span>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <span className="flex items-center gap-2">
                        <ShieldAlert size={14} className="text-red-500" />
                        Urgent
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label
                  htmlFor="auth-dateNeeded"
                  className="text-xs font-semibold"
                >
                  Date Needed <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="auth-dateNeeded"
                  type="date"
                  data-ocid="auth_new_req.date_needed.input"
                  value={form.dateNeeded}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dateNeeded: e.target.value }))
                  }
                  className="mt-1"
                />
                {formErrors.dateNeeded && (
                  <p
                    className="text-xs text-destructive mt-1"
                    data-ocid="auth_new_req.date_needed_error"
                  >
                    {formErrors.dateNeeded}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveNav("dashboard")}
                data-ocid="auth_new_req.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 sidebar-gradient text-white hover:opacity-90"
                onClick={handleSubmit}
                disabled={isSubmitting}
                data-ocid="auth_new_req.submit_button"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Requisition
              </Button>
            </div>
          </div>
        </div>
      )}

      <RequisitionModal
        requisition={selectedReq}
        open={!!selectedReq}
        onClose={() => setSelectedReq(null)}
      />
      <ActionModal
        open={!!actionReq}
        actionType={actionType}
        requisitionId={actionReq?.id ?? null}
        isPending={isApproving || isRejecting}
        onClose={() => {
          setActionReq(null);
          setActionType(null);
        }}
        onConfirm={handleAction}
      />
    </Layout>
  );
}
