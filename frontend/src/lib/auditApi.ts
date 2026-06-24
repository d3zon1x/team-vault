import apiClient from './apiClient';
import type { AuditLog, AuditLogFilters } from '../types/audit';
import type { PaginatedResponse } from '../types/pagination';

export const auditApi = {
  list: async (
    workspaceId: number,
    params?: AuditLogFilters,
  ): Promise<PaginatedResponse<AuditLog> | AuditLog[]> => {
    const { data } = await apiClient.get<
      PaginatedResponse<AuditLog> | AuditLog[]
    >(`/workspaces/${workspaceId}/audit-logs`, { params });
    return data;
  },
};
