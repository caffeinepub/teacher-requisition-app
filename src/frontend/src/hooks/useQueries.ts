import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AppRole,
  AuthorityView,
  Priority,
  RequisitionView,
  UserView,
} from "../types";
import { useActor } from "./useActor";

async function unwrap<T>(
  promise: Promise<{ ok: T } | { err: string }>,
): Promise<T> {
  const result = await promise;
  if ("ok" in result) return result.ok;
  throw new Error(result.err);
}

export function useGetMyRequisitions(sessionId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<RequisitionView[]>({
    queryKey: ["myRequisitions", sessionId],
    queryFn: async () => {
      if (!actor) return [];
      return unwrap((actor as any).getMyRequisitions(sessionId));
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}

export function useGetPendingRequisitions(sessionId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<RequisitionView[]>({
    queryKey: ["pendingRequisitions", sessionId],
    queryFn: async () => {
      if (!actor) return [];
      const all = await unwrap<RequisitionView[]>(
        (actor as any).getAllRequisitions(sessionId),
      );
      return all.filter((r) => "pending" in r.status);
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}

export function useGetApprovedRequisitions(sessionId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<RequisitionView[]>({
    queryKey: ["approvedRequisitions", sessionId],
    queryFn: async () => {
      if (!actor) return [];
      const all = await unwrap<RequisitionView[]>(
        (actor as any).getAllRequisitions(sessionId),
      );
      return all.filter((r) => "approved" in r.status);
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}

export function useGetAllRequisitions(sessionId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<RequisitionView[]>({
    queryKey: ["allRequisitions", sessionId],
    queryFn: async () => {
      if (!actor) return [];
      return unwrap((actor as any).getAllRequisitions(sessionId));
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}

export function useGetAllUsers(sessionId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<UserView[]>({
    queryKey: ["allUsers", sessionId],
    queryFn: async () => {
      if (!actor) return [];
      return unwrap((actor as any).listUsers(sessionId));
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}

export function useGetAuthorities(sessionId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AuthorityView[]>({
    queryKey: ["authorities", sessionId],
    queryFn: async () => {
      if (!actor) return [];
      return unwrap((actor as any).getAuthorities(sessionId));
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}

export function useSubmitRequisition(sessionId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      itemName: string;
      description: string;
      quantity: bigint;
      priority: Priority;
      dateNeeded: string;
      category: string;
      location: string;
      attachmentHash?: string;
      assignedAuthorityEmail?: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const attachmentHashOpt: [] | [string] = data.attachmentHash
        ? [data.attachmentHash]
        : [];
      const assignedAuthorityOpt: [] | [string] = data.assignedAuthorityEmail
        ? [data.assignedAuthorityEmail]
        : [];
      return unwrap(
        (actor as any).createRequisition(
          sessionId,
          data.itemName,
          data.description,
          data.quantity,
          data.priority,
          data.dateNeeded,
          data.category,
          data.location,
          attachmentHashOpt,
          assignedAuthorityOpt,
        ),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myRequisitions", sessionId] });
    },
  });
}

export function useApproveRequisition(sessionId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, remarks }: { id: bigint; remarks: string }) => {
      if (!actor) throw new Error("No actor");
      const opt: [] | [string] = remarks.trim() ? [remarks.trim()] : [];
      return unwrap((actor as any).approveRequisition(sessionId, id, opt));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingRequisitions", sessionId] });
      qc.invalidateQueries({ queryKey: ["allRequisitions", sessionId] });
    },
  });
}

export function useRejectRequisition(sessionId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, remarks }: { id: bigint; remarks: string }) => {
      if (!actor) throw new Error("No actor");
      return unwrap((actor as any).rejectRequisition(sessionId, id, remarks));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingRequisitions", sessionId] });
      qc.invalidateQueries({ queryKey: ["allRequisitions", sessionId] });
    },
  });
}

export function useCompleteRequisition(sessionId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: bigint; remarks: string }) => {
      if (!actor) throw new Error("No actor");
      return unwrap((actor as any).fulfillRequisition(sessionId, id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approvedRequisitions", sessionId] });
      qc.invalidateQueries({ queryKey: ["allRequisitions", sessionId] });
    },
  });
}

export function useMarkNotFulfilled(sessionId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, remarks }: { id: bigint; remarks: string }) => {
      if (!actor) throw new Error("No actor");
      return unwrap((actor as any).markNotFulfilled(sessionId, id, remarks));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approvedRequisitions", sessionId] });
      qc.invalidateQueries({ queryKey: ["allRequisitions", sessionId] });
    },
  });
}

export function useMarkReceived(sessionId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: bigint }) => {
      if (!actor) throw new Error("No actor");
      return unwrap((actor as any).markReceived(sessionId, id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myRequisitions", sessionId] });
      qc.invalidateQueries({ queryKey: ["allRequisitions", sessionId] });
      qc.invalidateQueries({ queryKey: ["approvedRequisitions", sessionId] });
    },
  });
}

export function useAdminCreateUser(sessionId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      name: string;
      role: AppRole;
    }) => {
      if (!actor) throw new Error("No actor");
      return unwrap(
        (actor as any).createUser(
          sessionId,
          data.email,
          data.password,
          data.name,
          data.role,
        ),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allUsers", sessionId] });
    },
  });
}

export function useAdminUpdateUser(sessionId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      email: string;
      newPassword?: string;
      newName?: string;
      newRole?: AppRole;
    }) => {
      if (!actor) throw new Error("No actor");
      const pwd: [] | [string] = data.newPassword ? [data.newPassword] : [];
      const name: [] | [string] = data.newName ? [data.newName] : [];
      const role: [] | [AppRole] = data.newRole ? [data.newRole] : [];
      return unwrap(
        (actor as any).updateUser(sessionId, data.email, pwd, name, role),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allUsers", sessionId] });
    },
  });
}

export function useAdminDeleteUser(sessionId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("No actor");
      return unwrap((actor as any).deleteUser(sessionId, email));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allUsers", sessionId] });
    },
  });
}
