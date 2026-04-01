/* eslint-disable */

// @ts-nocheck

import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

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
  | { notFulfilled: null };

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
}

export interface UserView {
  email: string;
  name: string;
  role: AppRole;
}

export interface LoginResult {
  sessionId: string;
  name: string;
  role: AppRole;
}

export interface _SERVICE {
  login: ActorMethod<[string, string], { ok: LoginResult } | { err: string }>;
  logout: ActorMethod<[string], void>;
  validateSession: ActorMethod<[string], [] | [{ email: string; name: string; role: AppRole }]>;
  createUser: ActorMethod<[string, string, string, string, AppRole], { ok: null } | { err: string }>;
  updateUser: ActorMethod<[string, string, [] | [string], [] | [string], [] | [AppRole]], { ok: null } | { err: string }>;
  deleteUser: ActorMethod<[string, string], { ok: null } | { err: string }>;
  listUsers: ActorMethod<[string], { ok: UserView[] } | { err: string }>;
  createRequisition: ActorMethod<[string, string, string, bigint, Priority, string, string, string], { ok: bigint } | { err: string }>;
  getMyRequisitions: ActorMethod<[string], { ok: RequisitionView[] } | { err: string }>;
  getAllRequisitions: ActorMethod<[string], { ok: RequisitionView[] } | { err: string }>;
  approveRequisition: ActorMethod<[string, bigint, [] | [string]], { ok: null } | { err: string }>;
  rejectRequisition: ActorMethod<[string, bigint, string], { ok: null } | { err: string }>;
  fulfillRequisition: ActorMethod<[string, bigint], { ok: null } | { err: string }>;
  markNotFulfilled: ActorMethod<[string, bigint, string], { ok: null } | { err: string }>;
}

export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
