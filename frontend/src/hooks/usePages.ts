import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { pageApi } from '../lib/pageApi';
import type { ListPagesParams, SearchPagesParams } from '../lib/pageApi';
import type {
  CreatePageBody,
  CreatePageVersionBody,
  PageAutosaveBody,
  PagePublishBody,
  UpdatePageBody,
} from '../types/page';
import { normalizePaginated } from '../types/pagination';

export const pageKeys = {
  all: ['pages'] as const,
  lists: () => [...pageKeys.all, 'list'] as const,
  list: (workspaceId: number, params?: ListPagesParams) =>
    [...pageKeys.lists(), workspaceId, params] as const,
  search: (workspaceId: number, params: SearchPagesParams) =>
    [...pageKeys.all, 'search', workspaceId, params] as const,
  details: () => [...pageKeys.all, 'detail'] as const,
  detail: (pageId: number) => [...pageKeys.details(), pageId] as const,
  versions: (pageId: number) => [...pageKeys.detail(pageId), 'versions'] as const,
  version: (pageId: number, versionId: number) =>
    [...pageKeys.versions(pageId), versionId] as const,
};

export function useWorkspacePages(
  workspaceId: number,
  params?: ListPagesParams,
) {
  return useQuery({
    queryKey: pageKeys.list(workspaceId, params),
    queryFn: async () => {
      const data = await pageApi.list(workspaceId, params);
      return normalizePaginated(data);
    },
    enabled: Number.isFinite(workspaceId) && workspaceId > 0,
  });
}

export function useSearchPages(
  workspaceId: number,
  params: SearchPagesParams | null,
) {
  return useQuery({
    queryKey: pageKeys.search(workspaceId, params!),
    queryFn: async () => {
      const data = await pageApi.search(workspaceId, params!);
      return normalizePaginated(data);
    },
    enabled:
      Number.isFinite(workspaceId) &&
      workspaceId > 0 &&
      !!params?.q?.trim(),
  });
}

export function usePage(pageId: number) {
  return useQuery({
    queryKey: pageKeys.detail(pageId),
    queryFn: () => pageApi.get(pageId),
    enabled: Number.isFinite(pageId) && pageId > 0,
  });
}

export function usePageVersions(pageId: number) {
  return useQuery({
    queryKey: pageKeys.versions(pageId),
    queryFn: () => pageApi.listVersions(pageId),
    enabled: Number.isFinite(pageId) && pageId > 0,
  });
}

export function useCreatePage(workspaceId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePageBody) => pageApi.create(workspaceId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.lists() });
    },
  });
}

export function useUpdatePage(pageId: number, workspaceId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdatePageBody) => pageApi.update(pageId, body),
    onSuccess: (data) => {
      queryClient.setQueryData(pageKeys.detail(pageId), data);
      if (workspaceId) {
        queryClient.invalidateQueries({ queryKey: pageKeys.list(workspaceId) });
      }
    },
  });
}

export function useAutosavePage(pageId: number, workspaceId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PageAutosaveBody) => pageApi.autosave(pageId, body),
    onSuccess: (data) => {
      queryClient.setQueryData(pageKeys.detail(pageId), data);
      if (workspaceId) {
        queryClient.invalidateQueries({ queryKey: pageKeys.list(workspaceId) });
      }
    },
  });
}

export function usePublishPage(pageId: number, workspaceId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body?: PagePublishBody) => pageApi.publish(pageId, body),
    onSuccess: (data) => {
      queryClient.setQueryData(pageKeys.detail(pageId), data);
      if (workspaceId) {
        queryClient.invalidateQueries({ queryKey: pageKeys.list(workspaceId) });
      }
    },
  });
}

export function useArchivePage(pageId: number, workspaceId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => pageApi.archive(pageId),
    onSuccess: (data) => {
      queryClient.setQueryData(pageKeys.detail(pageId), data);
      if (workspaceId) {
        queryClient.invalidateQueries({ queryKey: pageKeys.list(workspaceId) });
      }
    },
  });
}

export function useRestorePage(pageId: number, workspaceId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => pageApi.restore(pageId),
    onSuccess: (data) => {
      queryClient.setQueryData(pageKeys.detail(pageId), data);
      if (workspaceId) {
        queryClient.invalidateQueries({ queryKey: pageKeys.list(workspaceId) });
      }
    },
  });
}

export function useDeletePage(workspaceId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pageId: number) => pageApi.delete(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.list(workspaceId) });
    },
  });
}

export function useCreatePageVersion(pageId: number, workspaceId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body?: CreatePageVersionBody) =>
      pageApi.createVersion(pageId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.versions(pageId) });
      queryClient.invalidateQueries({ queryKey: pageKeys.detail(pageId) });
      if (workspaceId) {
        queryClient.invalidateQueries({ queryKey: pageKeys.list(workspaceId) });
      }
    },
  });
}

export function useRestorePageVersion(pageId: number, workspaceId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: number) =>
      pageApi.restoreVersion(pageId, versionId),
    onSuccess: (data) => {
      queryClient.setQueryData(pageKeys.detail(pageId), data);
      queryClient.invalidateQueries({ queryKey: pageKeys.versions(pageId) });
      if (workspaceId) {
        queryClient.invalidateQueries({ queryKey: pageKeys.list(workspaceId) });
      }
    },
  });
}
