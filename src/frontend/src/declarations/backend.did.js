/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

const AppRole = IDL.Variant({
  teacher: IDL.Null,
  authority: IDL.Null,
  adminStaff: IDL.Null,
  superAdmin: IDL.Null,
});

const Priority = IDL.Variant({
  low: IDL.Null,
  medium: IDL.Null,
  high: IDL.Null,
  urgent: IDL.Null,
});

const Status = IDL.Variant({
  pending: IDL.Null,
  approved: IDL.Null,
  rejected: IDL.Null,
  completed: IDL.Null,
  notFulfilled: IDL.Null,
  received: IDL.Null,
});

const HistoryEntry = IDL.Record({
  actorEmail: IDL.Text,
  actorName: IDL.Text,
  timestamp: IDL.Int,
  status: Status,
  remarks: IDL.Opt(IDL.Text),
});

const RequisitionView = IDL.Record({
  id: IDL.Nat,
  itemName: IDL.Text,
  description: IDL.Text,
  quantity: IDL.Nat,
  priority: Priority,
  dateNeeded: IDL.Text,
  teacherEmail: IDL.Text,
  teacherName: IDL.Text,
  createdAt: IDL.Int,
  status: Status,
  history: IDL.Vec(HistoryEntry),
  category: IDL.Text,
  location: IDL.Text,
  attachmentHash: IDL.Opt(IDL.Text),
  assignedAuthorityEmail: IDL.Opt(IDL.Text),
  assignedAdminStaffEmail: IDL.Opt(IDL.Text),
});

const UserView = IDL.Record({
  email: IDL.Text,
  name: IDL.Text,
  role: AppRole,
});

const AuthorityView = IDL.Record({
  email: IDL.Text,
  name: IDL.Text,
});

const AdminStaffView = IDL.Record({
  email: IDL.Text,
  name: IDL.Text,
});

const AppNotification = IDL.Record({
  recipientEmail: IDL.Text,
  requisitionId: IDL.Nat,
  message: IDL.Text,
  createdAt: IDL.Int,
  isRead: IDL.Bool,
});

const LoginResult = IDL.Record({
  sessionId: IDL.Text,
  name: IDL.Text,
  role: AppRole,
});

const SessionInfo = IDL.Record({
  email: IDL.Text,
  name: IDL.Text,
  role: AppRole,
});

const LoginVariant = IDL.Variant({ ok: LoginResult, err: IDL.Text });
const NullVariant = IDL.Variant({ ok: IDL.Null, err: IDL.Text });
const NatVariant = IDL.Variant({ ok: IDL.Nat, err: IDL.Text });
const UsersVariant = IDL.Variant({ ok: IDL.Vec(UserView), err: IDL.Text });
const AuthoritiesVariant = IDL.Variant({ ok: IDL.Vec(AuthorityView), err: IDL.Text });
const AdminStaffVariant = IDL.Variant({ ok: IDL.Vec(AdminStaffView), err: IDL.Text });
const RequisitionsVariant = IDL.Variant({ ok: IDL.Vec(RequisitionView), err: IDL.Text });
const NotificationsVariant = IDL.Variant({ ok: IDL.Vec(AppNotification), err: IDL.Text });

export const idlService = IDL.Service({
  login: IDL.Func([IDL.Text, IDL.Text], [LoginVariant], []),
  logout: IDL.Func([IDL.Text], [], []),
  validateSession: IDL.Func([IDL.Text], [IDL.Opt(SessionInfo)], ['query']),

  createUser: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, AppRole], [NullVariant], []),
  updateUser: IDL.Func([IDL.Text, IDL.Text, IDL.Opt(IDL.Text), IDL.Opt(IDL.Text), IDL.Opt(AppRole)], [NullVariant], []),
  deleteUser: IDL.Func([IDL.Text, IDL.Text], [NullVariant], []),
  listUsers: IDL.Func([IDL.Text], [UsersVariant], ['query']),
  getAuthorities: IDL.Func([IDL.Text], [AuthoritiesVariant], ['query']),
  getAdminStaff: IDL.Func([IDL.Text], [AdminStaffVariant], ['query']),

  createRequisition: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Nat, Priority, IDL.Text, IDL.Text, IDL.Text, IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)], [NatVariant], []),
  getMyRequisitions: IDL.Func([IDL.Text], [RequisitionsVariant], ['query']),
  getAllRequisitions: IDL.Func([IDL.Text], [RequisitionsVariant], ['query']),
  approveRequisition: IDL.Func([IDL.Text, IDL.Nat, IDL.Opt(IDL.Text)], [NullVariant], []),
  rejectRequisition: IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [NullVariant], []),
  fulfillRequisition: IDL.Func([IDL.Text, IDL.Nat], [NullVariant], []),
  markNotFulfilled: IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [NullVariant], []),
  markReceived: IDL.Func([IDL.Text, IDL.Nat], [NullVariant], []),
  assignAdminStaff: IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [NullVariant], []),

  getNotifications: IDL.Func([IDL.Text], [NotificationsVariant], ['query']),
  markNotificationsRead: IDL.Func([IDL.Text], [NullVariant], []),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const AppRole = IDL.Variant({
    teacher: IDL.Null,
    authority: IDL.Null,
    adminStaff: IDL.Null,
    superAdmin: IDL.Null,
  });
  const Priority = IDL.Variant({
    low: IDL.Null,
    medium: IDL.Null,
    high: IDL.Null,
    urgent: IDL.Null,
  });
  const Status = IDL.Variant({
    pending: IDL.Null,
    approved: IDL.Null,
    rejected: IDL.Null,
    completed: IDL.Null,
    notFulfilled: IDL.Null,
    received: IDL.Null,
  });
  const HistoryEntry = IDL.Record({
    actorEmail: IDL.Text,
    actorName: IDL.Text,
    timestamp: IDL.Int,
    status: Status,
    remarks: IDL.Opt(IDL.Text),
  });
  const RequisitionView = IDL.Record({
    id: IDL.Nat,
    itemName: IDL.Text,
    description: IDL.Text,
    quantity: IDL.Nat,
    priority: Priority,
    dateNeeded: IDL.Text,
    teacherEmail: IDL.Text,
    teacherName: IDL.Text,
    createdAt: IDL.Int,
    status: Status,
    history: IDL.Vec(HistoryEntry),
    category: IDL.Text,
    location: IDL.Text,
    attachmentHash: IDL.Opt(IDL.Text),
    assignedAuthorityEmail: IDL.Opt(IDL.Text),
    assignedAdminStaffEmail: IDL.Opt(IDL.Text),
  });
  const UserView = IDL.Record({
    email: IDL.Text,
    name: IDL.Text,
    role: AppRole,
  });
  const AuthorityView = IDL.Record({
    email: IDL.Text,
    name: IDL.Text,
  });
  const AdminStaffView = IDL.Record({
    email: IDL.Text,
    name: IDL.Text,
  });
  const AppNotification = IDL.Record({
    recipientEmail: IDL.Text,
    requisitionId: IDL.Nat,
    message: IDL.Text,
    createdAt: IDL.Int,
    isRead: IDL.Bool,
  });
  const LoginResult = IDL.Record({
    sessionId: IDL.Text,
    name: IDL.Text,
    role: AppRole,
  });
  const SessionInfo = IDL.Record({
    email: IDL.Text,
    name: IDL.Text,
    role: AppRole,
  });
  const LoginVariant = IDL.Variant({ ok: LoginResult, err: IDL.Text });
  const NullVariant = IDL.Variant({ ok: IDL.Null, err: IDL.Text });
  const NatVariant = IDL.Variant({ ok: IDL.Nat, err: IDL.Text });
  const UsersVariant = IDL.Variant({ ok: IDL.Vec(UserView), err: IDL.Text });
  const AuthoritiesVariant = IDL.Variant({ ok: IDL.Vec(AuthorityView), err: IDL.Text });
  const AdminStaffVariant = IDL.Variant({ ok: IDL.Vec(AdminStaffView), err: IDL.Text });
  const RequisitionsVariant = IDL.Variant({ ok: IDL.Vec(RequisitionView), err: IDL.Text });
  const NotificationsVariant = IDL.Variant({ ok: IDL.Vec(AppNotification), err: IDL.Text });
  return IDL.Service({
    login: IDL.Func([IDL.Text, IDL.Text], [LoginVariant], []),
    logout: IDL.Func([IDL.Text], [], []),
    validateSession: IDL.Func([IDL.Text], [IDL.Opt(SessionInfo)], ['query']),
    createUser: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, AppRole], [NullVariant], []),
    updateUser: IDL.Func([IDL.Text, IDL.Text, IDL.Opt(IDL.Text), IDL.Opt(IDL.Text), IDL.Opt(AppRole)], [NullVariant], []),
    deleteUser: IDL.Func([IDL.Text, IDL.Text], [NullVariant], []),
    listUsers: IDL.Func([IDL.Text], [UsersVariant], ['query']),
    getAuthorities: IDL.Func([IDL.Text], [AuthoritiesVariant], ['query']),
    getAdminStaff: IDL.Func([IDL.Text], [AdminStaffVariant], ['query']),
    createRequisition: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Nat, Priority, IDL.Text, IDL.Text, IDL.Text, IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)], [NatVariant], []),
    getMyRequisitions: IDL.Func([IDL.Text], [RequisitionsVariant], ['query']),
    getAllRequisitions: IDL.Func([IDL.Text], [RequisitionsVariant], ['query']),
    approveRequisition: IDL.Func([IDL.Text, IDL.Nat, IDL.Opt(IDL.Text)], [NullVariant], []),
    rejectRequisition: IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [NullVariant], []),
    fulfillRequisition: IDL.Func([IDL.Text, IDL.Nat], [NullVariant], []),
    markNotFulfilled: IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [NullVariant], []),
    markReceived: IDL.Func([IDL.Text, IDL.Nat], [NullVariant], []),
    assignAdminStaff: IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [NullVariant], []),
    getNotifications: IDL.Func([IDL.Text], [NotificationsVariant], ['query']),
    markNotificationsRead: IDL.Func([IDL.Text], [NullVariant], []),
  });
};

export const init = ({ IDL }) => { return []; };
