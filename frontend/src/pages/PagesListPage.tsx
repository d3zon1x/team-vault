import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, FileText, Search } from 'lucide-react';
import { useLayoutHeader } from '../context/LayoutContext';
import { useWorkspace } from '../hooks/useWorkspaces';
import { useWorkspacePages, useSearchPages } from '../hooks/usePages';
import { PageTree } from '../components/pages/PageTree';
import { PageStatusBadge } from '../components/pages/PageStatusBadge';
import { PageListSkeleton } from '../components/ui/Skeleton';
import { ErrorState, EmptyState } from '../components/ui/StateViews';
import {
  buildPageTree,
  formatRelativeTime,
  getApiErrorMessage,
} from '../lib/utils';
import type { PageStatus } from '../types/page';

type StatusFilter = 'all' | PageStatus;

export const PagesListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const workspaceId = Number(id);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { data: workspace } = useWorkspace(workspaceId);
  const isSearching = search.trim().length > 0;

  const {
    data: pagesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useWorkspacePages(workspaceId, { limit: 100 });

  const { data: searchData, isLoading: isSearchLoading } = useSearchPages(
    workspaceId,
    isSearching ? { q: search.trim(), limit: 50 } : null,
  );

  useLayoutHeader(
    {
      title: 'Pages',
      subtitle: workspace?.name,
      breadcrumbs: workspace
        ? [
            { label: 'Dashboard', to: '/dashboard' },
            { label: workspace.name, to: `/workspaces/${workspaceId}` },
            { label: 'Pages' },
          ]
        : undefined,
      searchPlaceholder: 'Search pages...',
      searchValue: search,
      onSearchChange: setSearch,
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
    [workspace, workspaceId, search],
  );

  const items = isSearching ? searchData?.items : pagesData?.items;
  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (statusFilter === 'all') return items;
    return items.filter((p) => p.status === statusFilter);
  }, [items, statusFilter]);

  const tree = useMemo(() => buildPageTree(filteredItems), [filteredItems]);

  const filters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'draft', label: 'Draft' },
    { key: 'published', label: 'Published' },
    { key: 'archived', label: 'Archived' },
  ];

  if (isLoading || (isSearching && isSearchLoading)) {
    return <PageListSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, 'Failed to load pages')}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
              statusFilter === f.key
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <EmptyState
          icon={<FileText className="text-slate-400" size={28} />}
          title={isSearching ? 'No results found' : 'No pages yet'}
          description={
            isSearching
              ? 'Try a different search term.'
              : 'Create your first documentation page to get started.'
          }
          action={
            !isSearching ? (
              <Link
                to={`/workspaces/${workspaceId}/pages/new`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
              >
                <Plus size={16} />
                Create page
              </Link>
            ) : undefined
          }
        />
      )}

      {!isSearching && filteredItems.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <PageTree nodes={tree} workspaceId={workspaceId} />
        </div>
      )}

      {isSearching && filteredItems.length > 0 && (
        <div className="space-y-2">
          {filteredItems.map((page) => (
            <Link
              key={page.id}
              to={`/workspaces/${workspaceId}/pages/${page.id}`}
              className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Search size={18} className="text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{page.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Updated {formatRelativeTime(page.updated_at)}
                </p>
              </div>
              <PageStatusBadge status={page.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
