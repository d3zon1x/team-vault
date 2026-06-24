import apiClient from './apiClient';
import type {
  Attachment,
  AttachmentDownloadUrl,
} from '../types/attachment';
import type { MessageResponse } from '../types/workspace';

export const attachmentApi = {
  list: async (pageId: number): Promise<Attachment[]> => {
    const { data } = await apiClient.get<Attachment[]>(
      `/pages/${pageId}/attachments`,
    );
    return data;
  },

  upload: async (pageId: number, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<Attachment>(
      `/pages/${pageId}/attachments`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  getDownloadUrl: async (
    attachmentId: number,
  ): Promise<AttachmentDownloadUrl> => {
    const { data } = await apiClient.get<AttachmentDownloadUrl>(
      `/attachments/${attachmentId}/download-url`,
    );
    return data;
  },

  delete: async (attachmentId: number): Promise<MessageResponse> => {
    const { data } = await apiClient.delete<MessageResponse>(
      `/attachments/${attachmentId}`,
    );
    return data;
  },
};
