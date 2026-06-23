import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '../lib/workspaceApi';
import type {
  AddMemberBody,
  CreateWorkspaceBody,
  UpdateMemberRoleBody,
  UpdateWorkspaceBody,
} from '../types/workspace';

export const workspaceKeys = {
  all: ['workspaces'] as const,
  lists: () => [...workspaceKeys.all, 'list'] as const,
  list: () => [...workspaceKeys.lists()] as const,
  details: () => [...workspaceKeys.all, 'detail'] as const,
  detail: (id: number) => [...workspaceKeys.details(), id] as const,
  members: (id: number) => [...workspaceKeys.detail(id), 'members'] as const,
};

export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.list(),
    queryFn: workspaceApi.list,
  });
}

export function useWorkspace(workspaceId: number) {
  return useQuery({
    queryKey: workspaceKeys.detail(workspaceId),
    queryFn: () => workspaceApi.get(workspaceId),
    enabled: Number.isFinite(workspaceId) && workspaceId > 0,
  });
}

export function useWorkspaceMembers(workspaceId: number) {
  return useQuery({
    queryKey: workspaceKeys.members(workspaceId),
    queryFn: () => workspaceApi.listMembers(workspaceId),
    enabled: Number.isFinite(workspaceId) && workspaceId > 0,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateWorkspaceBody) => workspaceApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.list() });
    },
  });
}

export function useUpdateWorkspace(workspaceId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateWorkspaceBody) =>
      workspaceApi.update(workspaceId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.list() });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workspaceId: number) => workspaceApi.delete(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.list() });
    },
  });
}

export function useAddMember(workspaceId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AddMemberBody) => workspaceApi.addMember(workspaceId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId) });
    },
  });
}

export function useUpdateMemberRole(workspaceId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberId,
      body,
    }: {
      memberId: number;
      body: UpdateMemberRoleBody;
    }) => workspaceApi.updateMemberRole(workspaceId, memberId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId) });
    },
  });
}

export function useRemoveMember(workspaceId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: number) =>
      workspaceApi.removeMember(workspaceId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId) });
    },
  });
}
