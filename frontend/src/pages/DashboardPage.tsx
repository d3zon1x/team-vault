import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderOpen } from 'lucide-react';
import { useLayoutHeader } from '../context/LayoutContext';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { WorkspaceCard } from '../components/workspace/WorkspaceCard';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/StateViews';
import { getApiErrorMessage } from '../lib/utils';

export const DashboardPage: React.FC = () => {
  const { data: workspaces, isLoading, isError, error, refetch } = useWorkspaces();

  useLayoutHeader(
    {
      title: 'Dashboard',
      subtitle: 'Your team knowledge bases',
      primaryAction: (
        <Link
          to="/workspaces/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors"
        >
          <Plus size={16} />
          New workspace
        </Link>
      ),
    },
    [],
  );

  return (
    <div>
      {isLoading && <LoadingState message="Loading workspaces..." />}

      {isError && (
        <ErrorState
          message={getApiErrorMessage(error, 'Failed to load workspaces')}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && workspaces?.length === 0 && (
        <EmptyState
          icon={<FolderOpen className="text-slate-400" size={28} />}
          title="No workspaces yet"
          description="Create your first workspace to start organizing team documentation."
          action={
            <Link
              to="/workspaces/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              <Plus size={16} />
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
