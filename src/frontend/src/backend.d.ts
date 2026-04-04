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
  | { notFulfilled: null }
  | { received: null };

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
  attachmentHash: [] | [string];
  assignedAuthorityEmail: [] | [string];
}

export interface UserView {
  email: string;
  name: string;
  role: AppRole;
}

export interface AuthorityView {
  email: string;
  name: string;
}

export interface LoginResult {
  sessionId: string;
  name: string;
  role: AppRole;
}

export interface backendInterface {
  login(email: string, password: string): Promise<{ ok: LoginResult } | { err: string }>;
  logout(sessionId: string): Promise<void>;
  validateSession(sessionId: string): Promise<[] | [{ email: string; name: string; role: AppRole }]>;

  createUser(sessionId: string, email: string, password: string, name: string, role: AppRole): Promise<{ ok: null } | { err: string }>;
  updateUser(sessionId: string, email: string, newPassword: [] | [string], newName: [] | [string], newRole: [] | [AppRole]): Promise<{ ok: null } | { err: string }>;
  deleteUser(sessionId: string, email: string): Promise<{ ok: null } | { err: string }>;
  listUsers(sessionId: string): Promise<{ ok: UserView[] } | { err: string }>;
  getAuthorities(sessionId: string): Promise<{ ok: AuthorityView[] } | { err: string }>;

  createRequisition(sessionId: string, itemName: string, description: string, quantity: bigint, priority: Priority, dateNeeded: string, category: string, location: string, attachmentHash: [] | [string], assignedAuthorityEmail: [] | [string]): Promise<{ ok: bigint } | { err: string }>;
  getMyRequisitions(sessionId: string): Promise<{ ok: RequisitionView[] } | { err: string }>;
  getAllRequisitions(sessionId: string): Promise<{ ok: RequisitionView[] } | { err: string }>;
  approveRequisition(sessionId: string, id: bigint, remarks: [] | [string]): Promise<{ ok: null } | { err: string }>;
  rejectRequisition(sessionId: string, id: bigint, remarks: string): Promise<{ ok: null } | { err: string }>;
  fulfillRequisition(sessionId: string, id: bigint): Promise<{ ok: null } | { err: string }>;
  markNotFulfilled(sessionId: string, id: bigint, remarks: string): Promise<{ ok: null } | { err: string }>;
  markReceived(sessionId: string, id: bigint): Promise<{ ok: null } | { err: string }>;
}
