import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentApi } from '../lib/attachmentApi';

export const attachmentKeys = {
  all: ['attachments'] as const,
  list: (pageId: number) => [...attachmentKeys.all, pageId] as const,
};

export function usePageAttachments(pageId: number) {
  return useQuery({
    queryKey: attachmentKeys.list(pageId),
    queryFn: () => attachmentApi.list(pageId),
    enabled: Number.isFinite(pageId) && pageId > 0,
  });
}

export function useUploadAttachment(pageId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => attachmentApi.upload(pageId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(pageId) });
    },
  });
}

export function useDeleteAttachment(pageId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: number) =>
      attachmentApi.delete(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(pageId) });
    },
  });
}

export function useAttachmentDownloadUrl() {
  return useMutation({
    mutationFn: (attachmentId: number) =>
      attachmentApi.getDownloadUrl(attachmentId),
  });
}
