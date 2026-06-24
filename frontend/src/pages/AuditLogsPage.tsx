import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ScrollText } from 'lucide-react';
import { useLayoutHeader } from '../context/LayoutContext';
import { useWorkspace } from '../hooks/useWorkspaces';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/StateViews';
import { formatDateTime, getApiErrorMessage } from '../lib/utils';

export const AuditLogsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const workspaceId = Number(id);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const { data: workspace } = useWorkspace(workspaceId);
  const { data, isLoading, isError, error, refetch } = useAuditLogs(
    workspaceId,
    {
      action: actionFilter || undefined,
      entity_type: entityFilter || undefined,
      limit: 50,
    },
  );

  useLayoutHeader(
    {
      title: 'Audit logs',
      subtitle: workspace?.name,
      breadcrumbs: workspace
        ? [
            { label: 'Dashboard', to: '/dashboard' },
            { label: workspace.name, to: `/workspaces/${workspaceId}` },
            { label: 'Audit logs' },
          ]
        : undefined,
    },
    [workspace, workspaceId],
  );

  if (isLoading) return <LoadingState message="Loading activity..." />;

  if (isError) {
    return (
      <ErrorState
        title="Unable to load audit logs"
        message={getApiErrorMessage(
          error,
          'You may need admin access to view activity logs.',
        )}
        onRetry={() => refetch()}
      />
    );
  }

  const logs = data?.items ?? [];

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All actions</option>
          <option value="page.created">Page created</option>
          <option value="page.updated">Page updated</option>
          <option value="page.published">Page published</option>
          <option value="page.archived">Page archived</option>
          <option value="page.deleted">Page deleted</option>
          <option value="attachment.uploaded">Attachment uploaded</option>
        </select>
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">All entities</option>
          <option value="page">Page</option>
          <option value="page_version">Page version</option>
          <option value="attachment">Attachment</option>
        </select>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="text-slate-400" size={28} />}
          title="No activity yet"
          description="Workspace actions will appear here as your team works."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {logs.map((log) => (
              <li key={log.id} className="px-5 py-4 flex gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900">{log.description}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                    <span className="font-medium text-slate-600">
                      {log.action}
                    </span>
                    <span>{log.entity_type} #{log.entity_id}</span>
                    <span>Actor #{log.actor_id}</span>
                    <span>{formatDateTime(log.created_at)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data && data.total > logs.length && (
        <p className="text-sm text-slate-500 text-center mt-4">
          Showing {logs.length} of {data.total} events
        </p>
      )}
    </div>
  );
};
