import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../lib/auditApi';
import type { AuditLogFilters } from '../types/audit';
import { normalizePaginated } from '../types/pagination';

export const auditKeys = {
  all: ['audit-logs'] as const,
  list: (workspaceId: number, filters?: AuditLogFilters) =>
    [...auditKeys.all, workspaceId, filters] as const,
};

export function useAuditLogs(
  workspaceId: number,
  filters?: AuditLogFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: auditKeys.list(workspaceId, filters),
    queryFn: async () => {
      const data = await auditApi.list(workspaceId, filters);
      return normalizePaginated(data);
    },
    enabled: enabled && Number.isFinite(workspaceId) && workspaceId > 0,
    retry: false,
  });
}
