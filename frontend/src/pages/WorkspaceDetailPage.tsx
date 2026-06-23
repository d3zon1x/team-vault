import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Users, Settings, FileText, Calendar } from 'lucide-react';
import { useWorkspace, useWorkspaceMembers } from '../hooks/useWorkspaces';
import { LoadingState, ErrorState } from '../components/ui/StateViews';
import { formatDateTime, getApiErrorMessage } from '../lib/utils';

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

  if (isLoading) {
    return <LoadingState message="Loading workspace..." />;
  }

  if (isError || !workspace) {
    return (
      <ErrorState
        title="Workspace not found"
        message={getApiErrorMessage(error, 'Failed to load workspace')}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
            <FileText className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{workspace.name}</h1>
            <p className="text-slate-500 text-sm mt-0.5">/{workspace.slug}</p>
          </div>
        </div>
        {workspace.description && (
          <p className="text-slate-300 mt-4 max-w-2xl">{workspace.description}</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Users size={16} />
            Members
          </div>
          <p className="text-2xl font-bold">{members?.length ?? '—'}</p>
        </div>
        <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Calendar size={16} />
            Created
          </div>
          <p className="text-sm font-medium text-slate-200">
            {formatDateTime(workspace.created_at)}
          </p>
        </div>
        <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Calendar size={16} />
            Last updated
          </div>
          <p className="text-sm font-medium text-slate-200">
            {formatDateTime(workspace.updated_at)}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to={`/workspaces/${workspace.id}/members`}
          className="group p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/40 transition-all"
        >
          <Users className="text-blue-400 mb-3" size={24} />
          <h3 className="font-semibold group-hover:text-blue-300 transition-colors">
            Manage members
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Invite teammates and manage roles
          </p>
        </Link>
        <Link
          to={`/workspaces/${workspace.id}/settings`}
          className="group p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/40 transition-all"
        >
          <Settings className="text-purple-400 mb-3" size={24} />
          <h3 className="font-semibold group-hover:text-purple-300 transition-colors">
            Workspace settings
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Update name, description, or delete workspace
          </p>
        </Link>
      </div>

      <div className="mt-8 p-5 rounded-xl bg-slate-800/30 border border-dashed border-slate-700">
        <p className="text-slate-500 text-sm text-center">
          Pages and documentation features coming soon
        </p>
      </div>
    </div>
  );
};
