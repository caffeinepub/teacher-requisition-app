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
  Paperclip,
  PlusCircle,
  Shield,
  ShieldAlert,
  Sparkles,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Layout } from "../components/Layout";
import { RequisitionModal } from "../components/RequisitionModal";
import { RequisitionTable } from "../components/RequisitionTable";
import {
  useGetAuthorities,
  useGetMyRequisitions,
  useMarkReceived,
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
    assignedAuthority: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: requisitions = [], isLoading } = useGetMyRequisitions(
    session.sessionId,
  );
  const { data: authorities = [], isLoading: isLoadingAuthorities } =
    useGetAuthorities(session.sessionId);
  const { mutateAsync: submitRequisition, isPending: isSubmitting } =
    useSubmitRequisition(session.sessionId);
  const { mutateAsync: markReceived } = useMarkReceived(session.sessionId);

  async function handleMarkReceived(req: RequisitionView) {
    try {
      await markReceived({ id: req.id });
      toast.success(
        "Requisition marked as received! Authority and Admin Staff have been notified.",
      );
    } catch {
      toast.error("Failed to mark as received.");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setPdfFile(null);
      setPdfError("");
      return;
    }
    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isUnder5MB = file.size <= 5 * 1024 * 1024;
    if (!isPdf || !isUnder5MB) {
      setPdfError("File must be a PDF and under 5MB.");
      setPdfFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setPdfFile(file);
    setPdfError("");
  }

  function clearFile() {
    setPdfFile(null);
    setPdfError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function validateForm() {
    const errors: Record<string, string> = {};
    if (!form.itemName.trim()) errors.itemName = "Item name is required.";
    if (!form.category) errors.category = "Category is required.";
    if (!form.assignedAuthority)
      errors.assignedAuthority = "Please select an authority to submit to.";
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

    let attachmentHash: string | undefined;

    if (pdfFile) {
      setIsUploading(true);
      try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i++)
          binary += String.fromCharCode(bytes[i]);
        attachmentHash = `data:application/pdf;base64,${btoa(binary)}`;
      } catch {
        toast.error("Failed to upload attachment.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    try {
      await submitRequisition({
        itemName: form.itemName.trim(),
        description: form.description.trim(),
        quantity: BigInt(Number.parseInt(form.quantity)),
        priority: PRIORITY_MAP[form.priority],
        dateNeeded: form.dateNeeded,
        category: form.category,
        location: form.location,
        attachmentHash,
        assignedAuthorityEmail: form.assignedAuthority,
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
        assignedAuthority: "",
      });
      clearFile();
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

  const isBusy = isSubmitting || isUploading;

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
              actions={["view", "received"]}
              onView={setSelectedReq}
              onReceived={(r) => {
                if ("completed" in r.status) handleMarkReceived(r);
              }}
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
            actions={["view", "received"]}
            onView={setSelectedReq}
            onReceived={(r) => {
              if ("completed" in r.status) handleMarkReceived(r);
            }}
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

              {/* Submit To — Authority Selector */}
              <div className="col-span-2">
                <Label
                  htmlFor="assignedAuthority"
                  className="text-xs font-semibold flex items-center gap-1.5"
                >
                  <Shield size={12} className="text-indigo-500" />
                  Submit To <span className="text-destructive">*</span>
                </Label>
                {!isLoadingAuthorities && authorities.length === 0 ? (
                  <>
                    <Select disabled>
                      <SelectTrigger
                        id="assignedAuthority"
                        className="mt-1"
                        data-ocid="new_req.authority.select"
                      >
                        <SelectValue placeholder="No authorities available" />
                      </SelectTrigger>
                      <SelectContent />
                    </Select>
                    <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                      <AlertTriangle size={11} />
                      No authority users found. Contact your administrator.
                    </p>
                  </>
                ) : (
                  <Select
                    value={form.assignedAuthority}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, assignedAuthority: v }))
                    }
                    disabled={isLoadingAuthorities}
                  >
                    <SelectTrigger
                      id="assignedAuthority"
                      className="mt-1"
                      data-ocid="new_req.authority.select"
                    >
                      <SelectValue
                        placeholder={
                          isLoadingAuthorities
                            ? "Loading..."
                            : "Select authority"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {authorities.map((auth) => (
                        <SelectItem key={auth.email} value={auth.email}>
                          <span className="flex items-center gap-2">
                            <Shield
                              size={13}
                              className="text-indigo-500 flex-shrink-0"
                            />
                            <span>
                              {auth.name}{" "}
                              <span className="text-muted-foreground text-xs">
                                ({auth.email})
                              </span>
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {formErrors.assignedAuthority && (
                  <p
                    className="text-xs text-destructive mt-1"
                    data-ocid="new_req.authority_error"
                  >
                    {formErrors.assignedAuthority}
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

              {/* PDF Upload Section */}
              <div className="col-span-2">
                <Label className="text-xs font-semibold">
                  Supporting Document{" "}
                  <span className="text-muted-foreground font-normal">
                    (Optional)
                  </span>
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5 mb-2">
                  PDF only &middot; Max 5MB
                </p>

                {!pdfFile ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-xl p-5 flex flex-col items-center gap-2 text-muted-foreground hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer"
                    data-ocid="new_req.upload_button"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <Paperclip size={18} className="text-indigo-500" />
                    </div>
                    <span className="text-xs font-medium">
                      Click to browse PDF
                    </span>
                    <span className="text-[11px]">PDF files up to 5MB</span>
                  </button>
                ) : (
                  <div className="w-full border border-indigo-200 bg-indigo-50 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {pdfFile.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatFileSize(pdfFile.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearFile}
                      className="w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-colors flex-shrink-0"
                      data-ocid="new_req.clear_upload_button"
                      aria-label="Remove file"
                    >
                      <X size={12} className="text-muted-foreground" />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {pdfError && (
                  <p
                    className="text-xs text-destructive mt-1"
                    data-ocid="new_req.upload_error"
                  >
                    {pdfError}
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
                disabled={isBusy}
                data-ocid="new_req.submit_button"
              >
                {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading
                  ? "Uploading..."
                  : isSubmitting
                    ? "Submitting..."
                    : "Submit Requisition"}
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
