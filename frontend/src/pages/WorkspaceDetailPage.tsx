import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  FileText,
  Users,
  Paperclip,
  Clock,
  Plus,
  Settings,
  ScrollText,
  ArrowRight,
} from 'lucide-react';
import { useLayoutHeader } from '../context/LayoutContext';
import { useWorkspace, useWorkspaceMembers } from '../hooks/useWorkspaces';
import { useWorkspacePages } from '../hooks/usePages';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { LoadingState, ErrorState } from '../components/ui/StateViews';
import { CardSkeleton } from '../components/ui/Skeleton';
import { PageStatusBadge } from '../components/pages/PageStatusBadge';
import {
  formatDateTime,
  formatRelativeTime,
  getApiErrorMessage,
} from '../lib/utils';

export const WorkspaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const workspaceId = Number(id);

  const {
    data: workspace,
    isLoading,
    isError,
    error,
    refetch,
  } = useWorkspace(workspaceId);

  const { data: members } = useWorkspaceMembers(workspaceId);
  const { data: pagesData, isLoading: pagesLoading } = useWorkspacePages(
    workspaceId,
    { limit: 5 },
  );
  const { data: allPages } = useWorkspacePages(workspaceId, { limit: 1 });
  const { data: auditData, isError: auditError } = useAuditLogs(
    workspaceId,
    { limit: 5 },
  );

  useLayoutHeader(
    {
      title: workspace?.name ?? 'Workspace',
      subtitle: workspace?.description ?? undefined,
      breadcrumbs: [
        { label: 'Dashboard', to: '/dashboard' },
        { label: workspace?.name ?? 'Workspace' },
      ],
      primaryAction: (
        <Link
          to={`/workspaces/${workspaceId}/pages/new`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors"
        >
          <Plus size={16} />
          New page
        </Link>
      ),
    },
    [workspace, workspaceId],
  );

  if (isLoading) return <LoadingState message="Loading workspace..." />;

  if (isError || !workspace) {
    return (
      <ErrorState
        title="Workspace not found"
        message={getApiErrorMessage(error, 'Failed to load workspace')}
        onRetry={() => refetch()}
      />
    );
  }

  const recentPages = pagesData?.items ?? [];
  const totalPages = allPages?.total ?? recentPages.length;
  const totalAttachments = 0; // derived per-page; show placeholder aggregate

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold shrink-0">
          {workspace.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm text-slate-500">/{workspace.slug}</p>
          {workspace.description && (
            <p className="text-slate-600 mt-2 max-w-2xl">{workspace.description}</p>
          )}
        </div>
      </div>

      {pagesLoading ? (
        <CardSkeleton />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <FileText size={16} />
              Pages
            </div>
            <p className="text-2xl font-semibold text-slate-900">{totalPages}</p>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <Users size={16} />
              Members
            </div>
            <p className="text-2xl font-semibold text-slate-900">
              {members?.length ?? '—'}
            </p>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <Paperclip size={16} />
              Attachments
            </div>
            <p className="text-2xl font-semibold text-slate-900">
              {totalAttachments || '—'}
            </p>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <Clock size={16} />
              Last updated
            </div>
            <p className="text-sm font-medium text-slate-700">
              {formatRelativeTime(workspace.updated_at)}
            </p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <Link
          to={`/workspaces/${workspaceId}/pages`}
          className="p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group"
        >
          <FileText className="text-blue-500 mb-3" size={22} />
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">
            Documentation
          </h3>
          <p className="text-sm text-slate-500 mt-1">Browse and edit pages</p>
        </Link>
        <Link
          to={`/workspaces/${workspaceId}/members`}
          className="p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group"
        >
          <Users className="text-purple-500 mb-3" size={22} />
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">
            Members
          </h3>
          <p className="text-sm text-slate-500 mt-1">Manage team access</p>
        </Link>
        <Link
          to={`/workspaces/${workspaceId}/settings`}
          className="p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all group"
        >
          <Settings className="text-slate-500 mb-3" size={22} />
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">
            Settings
          </h3>
          <p className="text-sm text-slate-500 mt-1">Workspace configuration</p>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Recent pages</h2>
            <Link
              to={`/workspaces/${workspaceId}/pages`}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recentPages.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto text-slate-300 mb-2" size={32} />
              <p className="text-sm text-slate-500 mb-3">No pages yet</p>
              <Link
                to={`/workspaces/${workspaceId}/pages/new`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus size={14} />
                Create first page
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {recentPages.map((page) => (
                <li key={page.id}>
                  <Link
                    to={`/workspaces/${workspaceId}/pages/${page.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {page.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        Updated {formatRelativeTime(page.updated_at)}
                      </p>
                    </div>
                    <PageStatusBadge status={page.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <ScrollText size={18} />
              Recent activity
            </h2>
            {!auditError && (
              <Link
                to={`/workspaces/${workspaceId}/audit-logs`}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all <ArrowRight size={14} />
              </Link>
            )}
          </div>
          {auditError ? (
            <p className="text-sm text-slate-500 py-4">
              Activity logs are not available for your role.
            </p>
          ) : !auditData?.items.length ? (
            <p className="text-sm text-slate-500 py-4">No recent activity.</p>
          ) : (
            <ul className="space-y-3">
              {auditData.items.map((log) => (
                <li
                  key={log.id}
                  className="flex gap-3 text-sm border-l-2 border-blue-200 pl-3"
                >
                  <div className="min-w-0">
                    <p className="text-slate-900">{log.description}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {log.action} · {formatDateTime(log.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
