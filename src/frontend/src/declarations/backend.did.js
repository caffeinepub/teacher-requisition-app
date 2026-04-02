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
});

const UserView = IDL.Record({
  email: IDL.Text,
  name: IDL.Text,
  role: AppRole,
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
const RequisitionsVariant = IDL.Variant({ ok: IDL.Vec(RequisitionView), err: IDL.Text });

export const idlService = IDL.Service({
  login: IDL.Func([IDL.Text, IDL.Text], [LoginVariant], []),
  logout: IDL.Func([IDL.Text], [], []),
  validateSession: IDL.Func([IDL.Text], [IDL.Opt(SessionInfo)], ['query']),

  createUser: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, AppRole], [NullVariant], []),
  updateUser: IDL.Func([IDL.Text, IDL.Text, IDL.Opt(IDL.Text), IDL.Opt(IDL.Text), IDL.Opt(AppRole)], [NullVariant], []),
  deleteUser: IDL.Func([IDL.Text, IDL.Text], [NullVariant], []),
  listUsers: IDL.Func([IDL.Text], [UsersVariant], ['query']),

  createRequisition: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Nat, Priority, IDL.Text, IDL.Text, IDL.Text], [NatVariant], []),
  getMyRequisitions: IDL.Func([IDL.Text], [RequisitionsVariant], ['query']),
  getAllRequisitions: IDL.Func([IDL.Text], [RequisitionsVariant], ['query']),
  approveRequisition: IDL.Func([IDL.Text, IDL.Nat, IDL.Opt(IDL.Text)], [NullVariant], []),
  rejectRequisition: IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [NullVariant], []),
  fulfillRequisition: IDL.Func([IDL.Text, IDL.Nat], [NullVariant], []),
  markNotFulfilled: IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [NullVariant], []),
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
  });
  const UserView = IDL.Record({
    email: IDL.Text,
    name: IDL.Text,
    role: AppRole,
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
  const RequisitionsVariant = IDL.Variant({ ok: IDL.Vec(RequisitionView), err: IDL.Text });
  return IDL.Service({
    login: IDL.Func([IDL.Text, IDL.Text], [LoginVariant], []),
    logout: IDL.Func([IDL.Text], [], []),
    validateSession: IDL.Func([IDL.Text], [IDL.Opt(SessionInfo)], ['query']),
    createUser: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, AppRole], [NullVariant], []),
    updateUser: IDL.Func([IDL.Text, IDL.Text, IDL.Opt(IDL.Text), IDL.Opt(IDL.Text), IDL.Opt(AppRole)], [NullVariant], []),
    deleteUser: IDL.Func([IDL.Text, IDL.Text], [NullVariant], []),
    listUsers: IDL.Func([IDL.Text], [UsersVariant], ['query']),
    createRequisition: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Nat, Priority, IDL.Text, IDL.Text, IDL.Text], [NatVariant], []),
    getMyRequisitions: IDL.Func([IDL.Text], [RequisitionsVariant], ['query']),
    getAllRequisitions: IDL.Func([IDL.Text], [RequisitionsVariant], ['query']),
    approveRequisition: IDL.Func([IDL.Text, IDL.Nat, IDL.Opt(IDL.Text)], [NullVariant], []),
    rejectRequisition: IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [NullVariant], []),
    fulfillRequisition: IDL.Func([IDL.Text, IDL.Nat], [NullVariant], []),
    markNotFulfilled: IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [NullVariant], []),
  });
};

export const init = ({ IDL }) => { return []; };
