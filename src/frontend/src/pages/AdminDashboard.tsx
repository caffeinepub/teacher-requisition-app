import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  BellDot,
  CheckCircle2,
  PackageCheck,
  PackageX,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ActionModal } from "../components/ActionModal";
import type { ActionType } from "../components/ActionModal";
import { Layout } from "../components/Layout";
import { RequisitionModal } from "../components/RequisitionModal";
import { RequisitionTable } from "../components/RequisitionTable";
import {
  useCompleteRequisition,
  useGetAdminStaff,
  useGetAllRequisitions,
  useGetApprovedRequisitions,
  useGetNotifications,
  useMarkNotFulfilled,
  useMarkNotificationsRead,
} from "../hooks/useQueries";
import type { SessionData } from "../hooks/useSession";
import type { AppNotification, RequisitionView } from "../types";

interface Props {
  session: SessionData;
  onLogout: () => void;
}

export function AdminDashboard({ session, onLogout }: Props) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [selectedReq, setSelectedReq] = useState<RequisitionView | null>(null);
  const [actionReq, setActionReq] = useState<RequisitionView | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);

  const { data: approved = [], isLoading: loadingApproved } =
    useGetApprovedRequisitions(session.sessionId);
  const { data: all = [], isLoading: loadingAll } = useGetAllRequisitions(
    session.sessionId,
  );
  const { data: notifications = [] } = useGetNotifications(session.sessionId);
  const { data: adminStaffList = [] } = useGetAdminStaff(session.sessionId);
  const { mutateAsync: complete, isPending: isCompleting } =
    useCompleteRequisition(session.sessionId);
  const { mutateAsync: notFulfilled, isPending: isMarking } =
    useMarkNotFulfilled(session.sessionId);
  const { mutateAsync: markAllRead } = useMarkNotificationsRead(
    session.sessionId,
  );

  // Build a map of email → name for all admin staff
  const adminStaffMap = useMemo(
    () => Object.fromEntries(adminStaffList.map((s) => [s.email, s.name])),
    [adminStaffList],
  );

  // Track which notification IDs have already been shown as toasts
  const shownNotifIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const unread = (notifications as AppNotification[]).filter(
      (n) => !n.isRead,
    );
    if (unread.length === 0) return;

    for (const notif of unread) {
      const key = `${notif.requisitionId.toString()}-${notif.createdAt.toString()}`;
      if (shownNotifIds.current.has(key)) continue;
      shownNotifIds.current.add(key);
      toast.info(notif.message, { description: "New assignment" });
    }

    // Mark all as read after showing toasts
    markAllRead().catch(() => {});
  }, [notifications, markAllRead]);

  const unreadCount = (notifications as AppNotification[]).filter(
    (n) => !n.isRead,
  ).length;

  function openAction(type: ActionType, req: RequisitionView) {
    setActionReq(req);
    setActionType(type);
  }

  async function handleAction(id: bigint, remarks: string) {
    try {
      if (actionType === "complete") {
        await complete({ id, remarks });
        toast.success("Requisition marked as completed.");
      } else if (actionType === "notFulfilled") {
        await notFulfilled({ id, remarks });
        toast.success("Requisition marked as not fulfilled.");
      }
      setActionReq(null);
      setActionType(null);
    } catch {
      toast.error("Action failed. Please try again.");
    }
  }

  const totalApproved = approved.length;
  const totalCompleted = all.filter((r) => "completed" in r.status).length;
  const totalNotFulfilled = all.filter(
    (r) => "notFulfilled" in r.status,
  ).length;
  const totalReceived = all.filter((r) => "received" in r.status).length;

  const statCards = [
    {
      label: "Awaiting Fulfillment",
      value: totalApproved,
      icon: <CheckCircle2 size={20} />,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      borderColor: "border-l-emerald-500",
      textColor: "text-emerald-700",
    },
    {
      label: "Completed",
      value: totalCompleted,
      icon: <PackageCheck size={20} />,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      borderColor: "border-l-indigo-500",
      textColor: "text-indigo-700",
    },
    {
      label: "Not Fulfilled",
      value: totalNotFulfilled,
      icon: <PackageX size={20} />,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-500",
      borderColor: "border-l-slate-400",
      textColor: "text-slate-600",
    },
    {
      label: "Confirmed Received",
      value: totalReceived,
      icon: <Bell size={20} />,
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
      borderColor: "border-l-teal-500",
      textColor: "text-teal-700",
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
              <h1 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                Admin Staff Dashboard
                {unreadCount > 0 && (
                  <span
                    className="inline-flex items-center gap-1 text-sm font-semibold text-white bg-red-500 rounded-full px-2 py-0.5"
                    data-ocid="admin_staff.notifications.toast"
                  >
                    <BellDot size={13} />
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Fulfill approved requisitions
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <h2 className="text-sm font-bold text-foreground mb-3">
              Approved &mdash; Awaiting Fulfillment
            </h2>
            <RequisitionTable
              data={approved.slice(0, 5)}
              isLoading={loadingApproved}
              showTeacher
              actions={["view", "complete", "notFulfilled"]}
              onView={setSelectedReq}
              onComplete={(r) => openAction("complete", r)}
              onNotFulfilled={(r) => openAction("notFulfilled", r)}
              currentUserEmail={session.email}
              adminStaffMap={adminStaffMap}
            />
          </div>
        </div>
      )}

      {(activeNav === "approved" || activeNav === "all") && (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground font-display">
            {activeNav === "approved"
              ? "Approved Requisitions"
              : "All Requisitions"}
          </h1>
          <Tabs
            value={activeNav}
            onValueChange={setActiveNav}
            data-ocid="admin_staff.tabs"
          >
            <TabsList className="bg-white border border-border">
              <TabsTrigger
                value="approved"
                data-ocid="admin_staff.approved.tab"
              >
                Approved ({approved.length})
              </TabsTrigger>
              <TabsTrigger value="all" data-ocid="admin_staff.all.tab">
                All ({all.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="approved" className="mt-4">
              <RequisitionTable
                data={approved}
                isLoading={loadingApproved}
                showTeacher
                actions={["view", "complete", "notFulfilled"]}
                onView={setSelectedReq}
                onComplete={(r) => openAction("complete", r)}
                onNotFulfilled={(r) => openAction("notFulfilled", r)}
                currentUserEmail={session.email}
                adminStaffMap={adminStaffMap}
              />
            </TabsContent>
            <TabsContent value="all" className="mt-4">
              <RequisitionTable
                data={all}
                isLoading={loadingAll}
                showTeacher
                actions={["view"]}
                onView={setSelectedReq}
                adminStaffMap={adminStaffMap}
              />
            </TabsContent>
          </Tabs>
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
        isPending={isCompleting || isMarking}
        onClose={() => {
          setActionReq(null);
          setActionType(null);
        }}
        onConfirm={handleAction}
      />
    </Layout>
  );
}
