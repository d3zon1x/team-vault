import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Archive,
  RotateCcw,
  Trash2,
  Send,
  Eye,
  Pencil,
  Columns2,
  Loader2,
} from 'lucide-react';
import { useLayoutHeader } from '../context/LayoutContext';
import { useWorkspace } from '../hooks/useWorkspaces';
import { useWorkspaceRole } from '../hooks/useWorkspaceRole';
import {
  usePage,
  useWorkspacePages,
  useAutosavePage,
  usePublishPage,
  useArchivePage,
  useRestorePage,
  useDeletePage,
  useCreatePageVersion,
} from '../hooks/usePages';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { PageTree } from '../components/pages/PageTree';
import { PageStatusBadge } from '../components/pages/PageStatusBadge';
import { MarkdownPreview } from '../components/pages/MarkdownPreview';
import { VersionHistoryPanel } from '../components/pages/VersionHistoryPanel';
import { AttachmentsPanel } from '../components/pages/AttachmentsPanel';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingState, ErrorState } from '../components/ui/StateViews';
import {
  buildPageTree,
  canEditDocuments,
  canDeletePage,
  formatRelativeTime,
  getApiErrorMessage,
} from '../lib/utils';
import { toast } from 'sonner';

type EditorMode = 'edit' | 'preview' | 'split';
type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

export const PageEditorPage: React.FC = () => {
  const { id, pageId: pageIdParam } = useParams<{ id: string; pageId: string }>();
  const workspaceId = Number(id);
  const pageId = Number(pageIdParam);
  const navigate = useNavigate();

  const { data: workspace } = useWorkspace(workspaceId);
  const { data: page, isLoading, isError, error, refetch } = usePage(pageId);
  const { data: pagesData } = useWorkspacePages(workspaceId, { limit: 100 });
  const { role } = useWorkspaceRole(workspaceId);
  const canEdit = canEditDocuments(role);
  const canDelete = canDeletePage(role);

  const autosave = useAutosavePage(pageId, workspaceId);
  const publishPage = usePublishPage(pageId, workspaceId);
  const archivePage = useArchivePage(pageId, workspaceId);
  const restorePage = useRestorePage(pageId, workspaceId);
  const deletePage = useDeletePage(workspaceId);
  const createVersion = useCreatePageVersion(pageId, workspaceId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editorMode, setEditorMode] = useState<EditorMode>('split');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [changeMessage, setChangeMessage] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  const tree = useMemo(
    () => buildPageTree(pagesData?.items ?? []),
    [pagesData?.items],
  );

  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setContent(page.content_markdown);
      setIsDirty(false);
      setSaveStatus('saved');
    }
  }, [page?.id, page?.updated_at]);

  const performAutosave = useCallback(
    async (newTitle: string, newContent: string) => {
      if (!canEdit) return;
      setSaveStatus('saving');
      try {
        await autosave.mutateAsync({
          title: newTitle,
          content_markdown: newContent,
        });
        setSaveStatus('saved');
        setIsDirty(false);
      } catch (err) {
        setSaveStatus('error');
        toast.error(getApiErrorMessage(err, 'Autosave failed'));
      }
    },
    [autosave, canEdit],
  );

  const debouncedAutosave = useDebouncedCallback(performAutosave, 1200);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setIsDirty(true);
    setSaveStatus('unsaved');
    if (canEdit) debouncedAutosave(value, content);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setIsDirty(true);
    setSaveStatus('unsaved');
    if (canEdit) debouncedAutosave(title, value);
  };

  const handleInsertMarkdown = (markdown: string) => {
    const newContent = content ? `${content}\n\n${markdown}` : markdown;
    handleContentChange(newContent);
  };

  const handlePublish = async () => {
    try {
      await publishPage.mutateAsync({});
      toast.success('Page published');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to publish'));
    }
  };

  const handleArchive = async () => {
    try {
      await archivePage.mutateAsync();
      toast.success('Page archived');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to archive'));
    }
  };

  const handleRestore = async () => {
    try {
      await restorePage.mutateAsync();
      toast.success('Page restored');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to restore'));
    }
  };

  const handleDelete = async () => {
    try {
      await deletePage.mutateAsync(pageId);
      toast.success('Page deleted');
      navigate(`/workspaces/${workspaceId}/pages`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete page'));
    }
  };

  const handleSaveVersion = async () => {
    if (showVersionDialog) {
      try {
        await createVersion.mutateAsync({
          change_message: changeMessage || null,
        });
        toast.success('Version saved');
        setShowVersionDialog(false);
        setChangeMessage('');
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to save version'));
      }
    } else {
      setShowVersionDialog(true);
    }
  };

  useLayoutHeader(
    {
      title: page?.title ?? 'Page',
      subtitle: workspace?.name,
      breadcrumbs: workspace
        ? [
            { label: 'Dashboard', to: '/dashboard' },
            { label: workspace.name, to: `/workspaces/${workspaceId}` },
            { label: 'Pages', to: `/workspaces/${workspaceId}/pages` },
            { label: page?.title ?? 'Page' },
          ]
        : undefined,
      primaryAction: canEdit ? (
        <div className="flex items-center gap-2">
          {page?.status === 'draft' && (
            <button
              onClick={handlePublish}
              disabled={publishPage.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 disabled:opacity-50"
            >
              <Send size={14} />
              Publish
            </button>
          )}
          {page?.status === 'published' && (
            <button
              onClick={handleArchive}
              disabled={archivePage.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              <Archive size={14} />
              Archive
            </button>
          )}
          {page?.status === 'archived' && (
            <button
              onClick={handleRestore}
              disabled={restorePage.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 disabled:opacity-50"
            >
              <RotateCcw size={14} />
              Restore
            </button>
          )}
        </div>
      ) : undefined,
    },
    [workspace, workspaceId, page, canEdit, publishPage.isPending],
  );

  if (isLoading) return <LoadingState message="Loading page..." />;

  if (isError || !page) {
    return (
      <ErrorState
        title="Page not found"
        message={getApiErrorMessage(error, 'Failed to load page')}
        onRetry={() => refetch()}
      />
    );
  }

  const saveStatusLabel = {
    idle: '',
    unsaved: 'Unsaved changes',
    saving: 'Saving...',
    saved: `Saved ${formatRelativeTime(page.updated_at)}`,
    error: 'Save failed',
  }[saveStatus];

  return (
    <div className="flex flex-col lg:flex-row gap-6 -mx-2">
      {/* Left: page tree */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-24 bg-white border border-slate-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Pages
          </p>
          <PageTree
            nodes={tree}
            workspaceId={workspaceId}
            activePageId={pageId}
            compact
          />
          <Link
            to={`/workspaces/${workspaceId}/pages/new`}
            className="block mt-2 px-2 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            + New page
          </Link>
        </div>
      </aside>

      {/* Center: editor */}
      <div className="flex-1 min-w-0">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50/50">
            <PageStatusBadge status={page.status} />
            <span
              className={`text-xs ${
                saveStatus === 'error'
                  ? 'text-red-500'
                  : saveStatus === 'saving'
                    ? 'text-blue-500'
                    : 'text-slate-500'
              }`}
            >
              {saveStatus === 'saving' && (
                <Loader2 size={12} className="inline animate-spin mr-1" />
              )}
              {saveStatusLabel || (isDirty ? 'Unsaved changes' : '')}
            </span>
            <div className="ml-auto flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
              {(
                [
                  { mode: 'edit' as const, icon: Pencil, label: 'Edit' },
                  { mode: 'split' as const, icon: Columns2, label: 'Split' },
                  { mode: 'preview' as const, icon: Eye, label: 'Preview' },
                ] as const
              ).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setEditorMode(mode)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    editorMode === mode
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {canEdit ? (
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-5 py-4 text-2xl font-semibold text-slate-900 border-b border-slate-100 focus:outline-none focus:bg-slate-50/50"
              placeholder="Page title"
            />
          ) : (
            <h1 className="px-5 py-4 text-2xl font-semibold text-slate-900 border-b border-slate-100">
              {title}
            </h1>
          )}

          <div
            className={`grid ${
              editorMode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'
            } min-h-[480px]`}
          >
            {(editorMode === 'edit' || editorMode === 'split') && (
              <div
                className={
                  editorMode === 'split' ? 'border-r border-slate-200' : ''
                }
              >
                {canEdit ? (
                  <textarea
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full h-full min-h-[480px] p-5 font-mono text-sm text-slate-800 focus:outline-none resize-none"
                    placeholder="Write markdown content..."
                  />
                ) : (
                  <pre className="p-5 font-mono text-sm text-slate-600 whitespace-pre-wrap">
                    {content}
                  </pre>
                )}
              </div>
            )}
            {(editorMode === 'preview' || editorMode === 'split') && (
              <div className="p-5 overflow-y-auto bg-slate-50/30">
                <MarkdownPreview content={content} />
              </div>
            )}
          </div>
        </div>

        {canDelete && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
              Delete page
            </button>
          </div>
        )}
      </div>

      {/* Right: details panel */}
      <aside className="w-full lg:w-72 shrink-0 space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-5 sticky top-24">
          <VersionHistoryPanel
            pageId={pageId}
            workspaceId={workspaceId}
            canEdit={canEdit}
            onSaveVersion={() => setShowVersionDialog(true)}
            isSavingVersion={createVersion.isPending}
          />
          <hr className="border-slate-200" />
          <AttachmentsPanel
            pageId={pageId}
            canEdit={canEdit}
            onInsertMarkdown={handleInsertMarkdown}
          />
        </div>
      </aside>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete this page?"
        description="This page and its versions will be permanently deleted."
        confirmLabel="Delete"
        variant="danger"
        isLoading={deletePage.isPending}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {showVersionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setShowVersionDialog(false)}
          />
          <div className="relative bg-white rounded-xl border border-slate-200 shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900">
              Save version
            </h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Create a named snapshot of the current page content.
            </p>
            <input
              value={changeMessage}
              onChange={(e) => setChangeMessage(e.target.value)}
              placeholder="What changed? (optional)"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowVersionDialog(false)}
                className="px-4 py-2 text-sm text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVersion}
                disabled={createVersion.isPending}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50"
              >
                {createVersion.isPending ? 'Saving...' : 'Save version'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
