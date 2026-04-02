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
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
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
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Layout } from "../components/Layout";
import { RequisitionModal } from "../components/RequisitionModal";
import { RequisitionTable } from "../components/RequisitionTable";
import {
  useGetMyRequisitions,
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

export function TeacherDashboard({ session, onLogout }: Props) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [selectedReq, setSelectedReq] = useState<RequisitionView | null>(null);
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

  const { data: requisitions = [], isLoading } = useGetMyRequisitions(
    session.sessionId,
  );
  const { mutateAsync: submitRequisition, isPending: isSubmitting } =
    useSubmitRequisition(session.sessionId);

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
      setActiveNav("requisitions");
    } catch {
      toast.error("Failed to submit requisition.");
    }
  }

  const pending = requisitions.filter((r) => "pending" in r.status).length;
  const approved = requisitions.filter((r) => "approved" in r.status).length;

  const statCards = [
    {
      label: "Total Requests",
      value: requisitions.length,
      icon: <ClipboardList size={20} />,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      borderColor: "border-l-indigo-500",
      textColor: "text-indigo-700",
    },
    {
      label: "Pending",
      value: pending,
      icon: <Clock size={20} />,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      borderColor: "border-l-amber-500",
      textColor: "text-amber-700",
    },
    {
      label: "Approved",
      value: approved,
      icon: <CheckCircle2 size={20} />,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      borderColor: "border-l-emerald-500",
      textColor: "text-emerald-700",
    },
  ];

  return (
    <Layout
      session={session}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      onLogout={onLogout}
    >
      {activeNav === "dashboard" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-display">
                Teacher Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage your resource requisitions
              </p>
            </div>
            <Button
              className="sidebar-gradient text-white hover:opacity-90 gap-2 shadow-md"
              onClick={() => setActiveNav("new")}
              data-ocid="teacher.new_requisition.primary_button"
            >
              <PlusCircle size={16} />
              New Requisition
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statCards.map((s) => (
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
            <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <FileText size={15} /> Recent Requisitions
            </h2>
            <RequisitionTable
              data={requisitions.slice(0, 5)}
              isLoading={isLoading}
              actions={["view"]}
              onView={setSelectedReq}
            />
          </div>
        </div>
      )}

      {activeNav === "requisitions" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-start justify-between">
            <h1 className="text-2xl font-bold text-foreground font-display">
              My Requisitions
            </h1>
            <Button
              className="sidebar-gradient text-white hover:opacity-90 gap-2 shadow-md"
              onClick={() => setActiveNav("new")}
              data-ocid="teacher.new_requisition.secondary_button"
            >
              <PlusCircle size={16} />
              New Requisition
            </Button>
          </div>
          <RequisitionTable
            data={requisitions}
            isLoading={isLoading}
            actions={["view"]}
            onView={setSelectedReq}
          />
        </div>
      )}

      {activeNav === "new" && (
        <div className="max-w-2xl space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-display">
              New Requisition
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Fill in the details for your resource request
            </p>
          </div>
          <div className="bg-white rounded-xl border border-border shadow-card p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="itemName" className="text-xs font-semibold">
                  Item Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="itemName"
                  data-ocid="new_req.item_name.input"
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
                    data-ocid="new_req.item_name_error"
                  >
                    {formErrors.itemName}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <Label htmlFor="category" className="text-xs font-semibold">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
                >
                  <SelectTrigger
                    id="category"
                    className="mt-1"
                    data-ocid="new_req.category.select"
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
                    data-ocid="new_req.category_error"
                  >
                    {formErrors.category}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <Label htmlFor="location" className="text-xs font-semibold">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  data-ocid="new_req.location.input"
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
                    data-ocid="new_req.location_error"
                  >
                    {formErrors.location}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <Label htmlFor="description" className="text-xs font-semibold">
                  Description / Purpose{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  data-ocid="new_req.description.textarea"
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
                    data-ocid="new_req.description_error"
                  >
                    {formErrors.description}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="quantity" className="text-xs font-semibold">
                  Quantity <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  data-ocid="new_req.quantity.input"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, quantity: e.target.value }))
                  }
                  className="mt-1"
                />
                {formErrors.quantity && (
                  <p
                    className="text-xs text-destructive mt-1"
                    data-ocid="new_req.quantity_error"
                  >
                    {formErrors.quantity}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="priority" className="text-xs font-semibold">
                  Priority
                </Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((p) => ({ ...p, priority: v }))}
                >
                  <SelectTrigger
                    id="priority"
                    className="mt-1"
                    data-ocid="new_req.priority.select"
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
                <Label htmlFor="dateNeeded" className="text-xs font-semibold">
                  Date Needed <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dateNeeded"
                  type="date"
                  data-ocid="new_req.date_needed.input"
                  value={form.dateNeeded}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dateNeeded: e.target.value }))
                  }
                  className="mt-1"
                />
                {formErrors.dateNeeded && (
                  <p
                    className="text-xs text-destructive mt-1"
                    data-ocid="new_req.date_needed_error"
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
                onClick={() => setActiveNav("requisitions")}
                data-ocid="new_req.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 sidebar-gradient text-white hover:opacity-90 shadow-md"
                onClick={handleSubmit}
                disabled={isSubmitting}
                data-ocid="new_req.submit_button"
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
    </Layout>
  );
}
