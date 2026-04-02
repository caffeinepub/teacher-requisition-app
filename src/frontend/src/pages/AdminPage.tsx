import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  BookOpen,
  GraduationCap,
  Loader2,
  LogOut,
  Menu,
  Pencil,
  PlusCircle,
  ShieldCheck,
  Trash2,
  Users,
  Wrench,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAdminCreateUser,
  useAdminDeleteUser,
  useAdminUpdateUser,
  useGetAllUsers,
} from "../hooks/useQueries";
import type { SessionData } from "../hooks/useSession";
import type { AppRole, UserView } from "../types";
import { getRoleName } from "../types";

interface Props {
  session: SessionData;
  onLogout: () => void;
}

const ROLE_OPTIONS: {
  value: string;
  label: string;
  role: AppRole;
  icon: ReactNode;
}[] = [
  {
    value: "teacher",
    label: "Teacher",
    role: { teacher: null },
    icon: <GraduationCap size={15} className="text-blue-500" />,
  },
  {
    value: "authority",
    label: "Authority",
    role: { authority: null },
    icon: <ShieldCheck size={15} className="text-purple-500" />,
  },
  {
    value: "adminStaff",
    label: "Admin Staff",
    role: { adminStaff: null },
    icon: <Wrench size={15} className="text-orange-500" />,
  },
];

function getRoleKey(role: AppRole): string {
  if ("teacher" in role) return "teacher";
  if ("authority" in role) return "authority";
  if ("adminStaff" in role) return "adminStaff";
  if ("superAdmin" in role) return "superAdmin";
  return "teacher";
}

const roleBadgeStyles: Record<string, string> = {
  teacher: "bg-blue-100 text-blue-700",
  authority: "bg-purple-100 text-purple-700",
  adminStaff: "bg-orange-100 text-orange-700",
  superAdmin: "bg-gray-100 text-gray-700",
};

interface UserFormState {
  name: string;
  email: string;
  password: string;
  role: string;
}

const emptyForm: UserFormState = {
  name: "",
  email: "",
  password: "",
  role: "teacher",
};

export function AdminPage({ session, onLogout }: Props) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editUser, setEditUser] = useState<UserView | null>(null);
  const [deleteEmail, setDeleteEmail] = useState<string | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<UserFormState>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: users = [], isLoading } = useGetAllUsers(session.sessionId);
  const { mutateAsync: createUser, isPending: isCreating } = useAdminCreateUser(
    session.sessionId,
  );
  const { mutateAsync: updateUser, isPending: isUpdating } = useAdminUpdateUser(
    session.sessionId,
  );
  const { mutateAsync: deleteUser, isPending: isDeleting } = useAdminDeleteUser(
    session.sessionId,
  );

  function openAdd() {
    setForm(emptyForm);
    setFormErrors({});
    setShowAddDialog(true);
  }

  function openEdit(user: UserView) {
    setEditUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: getRoleKey(user.role),
    });
    setFormErrors({});
  }

  function validateForm(isEdit: boolean): boolean {
    const errors: Partial<UserFormState> = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.email.trim()) errors.email = "Email is required.";
    if (!isEdit && !form.password.trim())
      errors.password = "Password is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleCreate() {
    if (!validateForm(false)) return;
    const roleObj = ROLE_OPTIONS.find((r) => r.value === form.role)?.role ?? {
      teacher: null,
    };
    try {
      await createUser({
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
        role: roleObj,
      });
      toast.success("User created successfully.");
      setShowAddDialog(false);
    } catch {
      toast.error("Failed to create user.");
    }
  }

  async function handleUpdate() {
    if (!editUser || !validateForm(true)) return;
    const roleObj = ROLE_OPTIONS.find((r) => r.value === form.role)?.role;
    try {
      await updateUser({
        email: editUser.email,
        newPassword: form.password.trim() || undefined,
        newName:
          form.name.trim() !== editUser.name ? form.name.trim() : undefined,
        newRole:
          roleObj && getRoleKey(roleObj) !== getRoleKey(editUser.role)
            ? roleObj
            : undefined,
      });
      toast.success("User updated successfully.");
      setEditUser(null);
    } catch {
      toast.error("Failed to update user.");
    }
  }

  async function handleDelete() {
    if (!deleteEmail) return;
    try {
      await deleteUser(deleteEmail);
      toast.success("User deleted.");
      setDeleteEmail(null);
    } catch {
      toast.error("Failed to delete user.");
    }
  }

  const initials = session.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className="sidebar-gradient w-60 flex-shrink-0 flex-col hidden md:flex"
        data-ocid="admin.panel"
      >
        <AdminSidebarContent
          session={session}
          initials={initials}
          onLogout={onLogout}
        />
      </aside>

      {/* Mobile sidebar drawer */}
      <aside
        className={`sidebar-gradient w-72 flex-shrink-0 flex flex-col shadow-2xl fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        data-ocid="admin.panel"
      >
        <AdminSidebarContent
          session={session}
          initials={initials}
          onLogout={onLogout}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-border flex items-center justify-between px-4 md:px-6 h-14 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              data-ocid="admin.menu.button"
            >
              <Menu size={20} />
            </button>
            <Users
              size={16}
              className="text-muted-foreground hidden md:block"
            />
            <span className="text-sm font-semibold text-foreground">
              User Management
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-foreground leading-tight">
                {session.name}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Super Admin
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground font-display">
                  User Management
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Create and manage user accounts and roles
                </p>
              </div>
              <Button
                className="sidebar-gradient text-white hover:opacity-90 gap-2"
                onClick={openAdd}
                data-ocid="admin.add_user.primary_button"
              >
                <PlusCircle size={16} />
                Add User
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Users",
                  value: users.length,
                  icon: <Users size={16} />,
                  iconBg: "bg-indigo-100",
                  iconColor: "text-indigo-600",
                  borderColor: "border-l-indigo-500",
                  textColor: "text-indigo-700",
                },
                {
                  label: "Teachers",
                  value: users.filter((u) => "teacher" in u.role).length,
                  icon: <GraduationCap size={16} />,
                  iconBg: "bg-sky-100",
                  iconColor: "text-sky-600",
                  borderColor: "border-l-sky-500",
                  textColor: "text-sky-700",
                },
                {
                  label: "Authority",
                  value: users.filter((u) => "authority" in u.role).length,
                  icon: <ShieldCheck size={16} />,
                  iconBg: "bg-violet-100",
                  iconColor: "text-violet-600",
                  borderColor: "border-l-violet-500",
                  textColor: "text-violet-700",
                },
                {
                  label: "Admin Staff",
                  value: users.filter((u) => "adminStaff" in u.role).length,
                  icon: <Wrench size={16} />,
                  iconBg: "bg-orange-100",
                  iconColor: "text-orange-600",
                  borderColor: "border-l-orange-500",
                  textColor: "text-orange-700",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`bg-white rounded-xl border border-border border-l-4 ${s.borderColor} shadow-card p-3 flex items-center gap-3 overflow-hidden`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${s.iconBg} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className={s.iconColor}>{s.icon}</span>
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide leading-tight truncate">
                      {s.label}
                    </p>
                    <p
                      className={`text-2xl font-bold leading-tight ${s.textColor}`}
                    >
                      {s.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="bg-white rounded-[10px] border border-border shadow-card overflow-x-auto"
              data-ocid="admin.users.table"
            >
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F6F8FB] hover:bg-[#F6F8FB]">
                    <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Name
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                      Email
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide w-32">
                      Role
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
                        key={`sk-${i + 1}`}
                        data-ocid={`admin.users.item.${i + 1}`}
                      >
                        <TableCell colSpan={4}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-10"
                        data-ocid="admin.users.empty_state"
                      >
                        <p className="text-sm text-muted-foreground">
                          No users found. Add the first user.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user, idx) => {
                      const rk = getRoleKey(user.role);
                      const uin = user.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2);
                      return (
                        <TableRow
                          key={user.email}
                          className="border-[#EEF2F7] hover:bg-muted/30"
                          data-ocid={`admin.users.item.${idx + 1}`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0">
                                {uin}
                              </div>
                              <span className="text-sm font-medium text-foreground">
                                {user.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${roleBadgeStyles[rk] ?? "bg-gray-100 text-gray-600"}`}
                            >
                              {getRoleName(user.role)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                onClick={() => openEdit(user)}
                                data-ocid={`admin.users.edit_button.${idx + 1}`}
                              >
                                <Pencil size={13} />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setDeleteEmail(user.email)}
                                data-ocid={`admin.users.delete_button.${idx + 1}`}
                              >
                                <Trash2 size={13} />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>

      <Dialog
        open={showAddDialog}
        onOpenChange={(v) => !v && setShowAddDialog(false)}
      >
        <DialogContent data-ocid="admin.add_user.dialog">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account and assign their role.
            </DialogDescription>
          </DialogHeader>
          <UserForm
            form={form}
            onChange={setForm}
            errors={formErrors}
            showPassword
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              data-ocid="admin.add_user.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="sidebar-gradient text-white hover:opacity-90"
              onClick={handleCreate}
              disabled={isCreating}
              data-ocid="admin.add_user.submit_button"
            >
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editUser} onOpenChange={(v) => !v && setEditUser(null)}>
        <DialogContent data-ocid="admin.edit_user.dialog">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details. Leave password blank to keep unchanged.
            </DialogDescription>
          </DialogHeader>
          <UserForm
            form={form}
            onChange={setForm}
            errors={formErrors}
            showPassword
            passwordOptional
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditUser(null)}
              data-ocid="admin.edit_user.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="sidebar-gradient text-white hover:opacity-90"
              onClick={handleUpdate}
              disabled={isUpdating}
              data-ocid="admin.edit_user.submit_button"
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteEmail}
        onOpenChange={(v) => !v && setDeleteEmail(null)}
      >
        <AlertDialogContent data-ocid="admin.delete_user.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteEmail}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.delete_user.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={isDeleting}
              data-ocid="admin.delete_user.confirm_button"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AdminSidebarContent({
  session,
  initials,
  onLogout,
  onClose,
}: {
  session: SessionData;
  initials: string;
  onLogout: () => void;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/20">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20">
          <BookOpen size={16} className="text-white" />
        </div>
        <span className="text-white font-bold text-base tracking-tight flex-1">
          SchoolReq
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>
      <nav className="flex-1 py-4 px-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50 px-3 mb-2">
          Navigation
        </p>
        <button
          type="button"
          data-ocid="admin.users.link"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors bg-white/20 text-white"
        >
          <Users size={18} />
          User Management
        </button>
      </nav>
      <div className="px-3 py-4 border-t border-white/20">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">
              {session.name}
            </p>
            <p className="text-white/50 text-[10px]">Super Admin</p>
          </div>
        </div>
        <button
          type="button"
          data-ocid="admin.logout.button"
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white text-sm transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  );
}

interface UserFormProps {
  form: UserFormState;
  onChange: (form: UserFormState) => void;
  errors: Partial<UserFormState>;
  showPassword?: boolean;
  passwordOptional?: boolean;
}

function UserForm({
  form,
  onChange,
  errors,
  showPassword,
  passwordOptional,
}: UserFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="uf-name" className="text-xs font-semibold">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="uf-name"
          data-ocid="admin.user_form.name.input"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          placeholder="Enter full name"
          className="mt-1"
        />
        {errors.name && (
          <p
            className="text-xs text-destructive mt-1"
            data-ocid="admin.user_form.name_error"
          >
            {errors.name}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="uf-email" className="text-xs font-semibold">
          Email Address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="uf-email"
          type="email"
          data-ocid="admin.user_form.email.input"
          value={form.email}
          onChange={(e) => onChange({ ...form, email: e.target.value })}
          placeholder="user@msbinstitute.com"
          className="mt-1"
        />
        {errors.email && (
          <p
            className="text-xs text-destructive mt-1"
            data-ocid="admin.user_form.email_error"
          >
            {errors.email}
          </p>
        )}
      </div>
      {showPassword && (
        <div>
          <Label htmlFor="uf-password" className="text-xs font-semibold">
            Password{" "}
            {!passwordOptional && <span className="text-destructive">*</span>}
            {passwordOptional && (
              <span className="text-muted-foreground font-normal">
                {" "}
                (leave blank to keep)
              </span>
            )}
          </Label>
          <Input
            id="uf-password"
            type="password"
            data-ocid="admin.user_form.password.input"
            value={form.password}
            onChange={(e) => onChange({ ...form, password: e.target.value })}
            placeholder={
              passwordOptional
                ? "Leave blank to keep current"
                : "Enter password"
            }
            className="mt-1"
          />
          {errors.password && (
            <p
              className="text-xs text-destructive mt-1"
              data-ocid="admin.user_form.password_error"
            >
              {errors.password}
            </p>
          )}
        </div>
      )}
      <div>
        <Label className="text-xs font-semibold">
          Role <span className="text-destructive">*</span>
        </Label>
        <Select
          value={form.role}
          onValueChange={(v) => onChange({ ...form, role: v })}
        >
          <SelectTrigger
            className="mt-1"
            data-ocid="admin.user_form.role.select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                <span className="flex items-center gap-2">
                  {r.icon}
                  {r.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
