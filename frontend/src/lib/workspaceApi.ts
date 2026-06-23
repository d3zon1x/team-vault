import apiClient from './apiClient';
import type {
  AddMemberBody,
  CreateWorkspaceBody,
  MessageResponse,
  UpdateMemberRoleBody,
  UpdateWorkspaceBody,
  Workspace,
  WorkspaceMember,
} from '../types/workspace';

export const workspaceApi = {
  list: async (): Promise<Workspace[]> => {
    const { data } = await apiClient.get<Workspace[]>('/workspaces');
    return data;
  },

  get: async (workspaceId: number): Promise<Workspace> => {
    const { data } = await apiClient.get<Workspace>(`/workspaces/${workspaceId}`);
    return data;
  },

  create: async (body: CreateWorkspaceBody): Promise<Workspace> => {
    const { data } = await apiClient.post<Workspace>('/workspaces', body);
    return data;
  },

  update: async (
    workspaceId: number,
    body: UpdateWorkspaceBody,
  ): Promise<Workspace> => {
    const { data } = await apiClient.patch<Workspace>(
      `/workspaces/${workspaceId}`,
      body,
    );
    return data;
  },

  delete: async (workspaceId: number): Promise<MessageResponse> => {
    const { data } = await apiClient.delete<MessageResponse>(
      `/workspaces/${workspaceId}`,
    );
    return data;
  },

  listMembers: async (workspaceId: number): Promise<WorkspaceMember[]> => {
    const { data } = await apiClient.get<WorkspaceMember[]>(
      `/workspaces/${workspaceId}/members`,
    );
    return data;
  },

  addMember: async (
    workspaceId: number,
    body: AddMemberBody,
  ): Promise<WorkspaceMember> => {
    const { data } = await apiClient.post<WorkspaceMember>(
      `/workspaces/${workspaceId}/members`,
      body,
    );
    return data;
  },

  updateMemberRole: async (
    workspaceId: number,
    memberId: number,
    body: UpdateMemberRoleBody,
  ): Promise<WorkspaceMember> => {
    const { data } = await apiClient.patch<WorkspaceMember>(
      `/workspaces/${workspaceId}/members/${memberId}`,
      body,
    );
    return data;
  },

  removeMember: async (
    workspaceId: number,
    memberId: number,
  ): Promise<MessageResponse> => {
    const { data } = await apiClient.delete<MessageResponse>(
      `/workspaces/${workspaceId}/members/${memberId}`,
    );
    return data;
  },
};
