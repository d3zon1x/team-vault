import React, { useState } from 'react';
import { History, RotateCcw, Eye } from 'lucide-react';
import {
  usePageVersions,
  useRestorePageVersion,
} from '../../hooks/usePages';
import { formatDateTime, getApiErrorMessage } from '../../lib/utils';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { MarkdownPreview } from './MarkdownPreview';
import { toast } from 'sonner';

interface VersionHistoryPanelProps {
  pageId: number;
  workspaceId: number;
  canEdit: boolean;
  onSaveVersion: () => void;
  isSavingVersion?: boolean;
}

export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
  pageId,
  workspaceId,
  canEdit,
  onSaveVersion,
  isSavingVersion,
}) => {
  const { data: versions, isLoading } = usePageVersions(pageId);
  const restoreVersion = useRestorePageVersion(pageId, workspaceId);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [restoreId, setRestoreId] = useState<number | null>(null);

  const viewingVersion = versions?.find((v) => v.id === viewingId);

  const handleRestore = async () => {
    if (!restoreId) return;
    try {
      await restoreVersion.mutateAsync(restoreId);
      toast.success('Version restored');
      setRestoreId(null);
      setViewingId(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to restore version'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <History size={16} />
          Version history
        </h3>
        {canEdit && (
          <button
            onClick={onSaveVersion}
            disabled={isSavingVersion}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            {isSavingVersion ? 'Saving...' : 'Save version'}
          </button>
        )}
      </div>

      {isLoading && (
        <p className="text-sm text-slate-500">Loading versions...</p>
      )}

      {!isLoading && (!versions || versions.length === 0) && (
        <p className="text-sm text-slate-500">No saved versions yet.</p>
      )}

      {versions && versions.length > 0 && (
        <ul className="space-y-2 max-h-48 overflow-y-auto">
          {versions.map((version) => (
            <li
              key={version.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    v{version.version_number}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatDateTime(version.created_at)}
                  </p>
                  {version.change_message && (
                    <p className="text-xs text-slate-600 mt-1 truncate">
                      {version.change_message}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() =>
                      setViewingId(viewingId === version.id ? null : version.id)
                    }
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                    title="View"
                  >
                    <Eye size={14} />
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => setRestoreId(version.id)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 rounded"
                      title="Restore"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {viewingVersion && (
        <div className="border border-slate-200 rounded-lg p-4 max-h-64 overflow-y-auto bg-white">
          <p className="text-xs font-medium text-slate-500 mb-2">
            Preview v{viewingVersion.version_number}
          </p>
          <MarkdownPreview content={viewingVersion.content_markdown} />
        </div>
      )}

      <ConfirmDialog
        open={restoreId !== null}
        title="Restore this version?"
        description="The current page content will be replaced with this version. You can save a new version afterward."
        confirmLabel="Restore"
        variant="default"
        isLoading={restoreVersion.isPending}
        onConfirm={handleRestore}
        onCancel={() => setRestoreId(null)}
      />
    </div>
  );
};
