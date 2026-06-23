import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderOpen } from 'lucide-react';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { WorkspaceCard } from '../components/workspace/WorkspaceCard';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/StateViews';
import { getApiErrorMessage } from '../lib/utils';

export const DashboardPage: React.FC = () => {
  const { data: workspaces, isLoading, isError, error, refetch } = useWorkspaces();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Workspaces</h1>
          <p className="text-slate-400 mt-1">
            Manage your team knowledge bases
          </p>
        </div>
        <Link
          to="/workspaces/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all text-sm"
        >
          <Plus size={18} />
          New workspace
        </Link>
      </div>

      {isLoading && <LoadingState message="Loading workspaces..." />}

      {isError && (
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load workspaces')}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && workspaces?.length === 0 && (
        <EmptyState
          icon={<FolderOpen className="text-slate-500" size={28} />}
          title="No workspaces yet"
          description="Create your first workspace to start organizing team documentation."
          action={
            <Link
              to="/workspaces/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              <Plus size={18} />
              Create workspace
            </Link>
          }
        />
      )}

      {!isLoading && !isError && workspaces && workspaces.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>
      )}
    </div>
  );
};
