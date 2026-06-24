import apiClient from './apiClient';
import type { PaginatedResponse } from '../types/pagination';
import type {
  CreatePageBody,
  CreatePageVersionBody,
  Page,
  PageAutosaveBody,
  PageListItem,
  PagePublishBody,
  PageVersion,
  UpdatePageBody,
} from '../types/page';
import type { MessageResponse } from '../types/workspace';

export interface ListPagesParams {
  include_archived?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchPagesParams {
  q: string;
  include_archived?: boolean;
  limit?: number;
  offset?: number;
}

export const pageApi = {
  list: async (
    workspaceId: number,
    params?: ListPagesParams,
  ): Promise<PaginatedResponse<PageListItem> | PageListItem[]> => {
    const { data } = await apiClient.get<
      PaginatedResponse<PageListItem> | PageListItem[]
    >(`/workspaces/${workspaceId}/pages`, { params });
    return data;
  },

  search: async (
    workspaceId: number,
    params: SearchPagesParams,
  ): Promise<PaginatedResponse<PageListItem> | PageListItem[]> => {
    const { data } = await apiClient.get<
      PaginatedResponse<PageListItem> | PageListItem[]
    >(`/workspaces/${workspaceId}/pages/search`, { params });
    return data;
  },

  get: async (pageId: number): Promise<Page> => {
    const { data } = await apiClient.get<Page>(`/pages/${pageId}`);
    return data;
  },

  create: async (
    workspaceId: number,
    body: CreatePageBody,
  ): Promise<Page> => {
    const { data } = await apiClient.post<Page>(
      `/workspaces/${workspaceId}/pages`,
      body,
    );
    return data;
  },

  update: async (pageId: number, body: UpdatePageBody): Promise<Page> => {
    const { data } = await apiClient.patch<Page>(`/pages/${pageId}`, body);
    return data;
  },

  autosave: async (
    pageId: number,
    body: PageAutosaveBody,
  ): Promise<Page> => {
    const { data } = await apiClient.patch<Page>(
      `/pages/${pageId}/autosave`,
      body,
    );
    return data;
  },

  publish: async (
    pageId: number,
    body?: PagePublishBody,
  ): Promise<Page> => {
    const { data } = await apiClient.post<Page>(
      `/pages/${pageId}/publish`,
      body ?? {},
    );
    return data;
  },

  archive: async (pageId: number): Promise<Page> => {
    const { data } = await apiClient.post<Page>(`/pages/${pageId}/archive`);
    return data;
  },

  restore: async (pageId: number): Promise<Page> => {
    const { data } = await apiClient.post<Page>(`/pages/${pageId}/restore`);
    return data;
  },

  delete: async (pageId: number): Promise<MessageResponse> => {
    const { data } = await apiClient.delete<MessageResponse>(
      `/pages/${pageId}`,
    );
    return data;
  },

  listVersions: async (pageId: number): Promise<PageVersion[]> => {
    const { data } = await apiClient.get<PageVersion[]>(
      `/pages/${pageId}/versions`,
    );
    return data;
  },

  getVersion: async (
    pageId: number,
    versionId: number,
  ): Promise<PageVersion> => {
    const { data } = await apiClient.get<PageVersion>(
      `/pages/${pageId}/versions/${versionId}`,
    );
    return data;
  },

  createVersion: async (
    pageId: number,
    body?: CreatePageVersionBody,
  ): Promise<PageVersion> => {
    const { data } = await apiClient.post<PageVersion>(
      `/pages/${pageId}/versions`,
      body ?? {},
    );
    return data;
  },

  restoreVersion: async (
    pageId: number,
    versionId: number,
  ): Promise<Page> => {
    const { data } = await apiClient.post<Page>(
      `/pages/${pageId}/versions/${versionId}/restore`,
    );
    return data;
  },
};
