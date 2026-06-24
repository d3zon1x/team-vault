import React, { useRef, useState } from 'react';
import {
  Paperclip,
  Upload,
  Download,
  Trash2,
  Loader2,
  Image,
  FileText,
  Link2,
} from 'lucide-react';
import {
  usePageAttachments,
  useUploadAttachment,
  useDeleteAttachment,
  useAttachmentDownloadUrl,
} from '../../hooks/useAttachments';
import {
  formatDate,
  formatFileSize,
  getApiErrorMessage,
} from '../../lib/utils';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { toast } from 'sonner';

interface AttachmentsPanelProps {
  pageId: number;
  canEdit: boolean;
  onInsertMarkdown?: (markdown: string) => void;
}

function FileIcon({ contentType }: { contentType: string }) {
  if (contentType.startsWith('image/')) {
    return <Image size={16} className="text-purple-500" />;
  }
  return <FileText size={16} className="text-blue-500" />;
}

export const AttachmentsPanel: React.FC<AttachmentsPanelProps> = ({
  pageId,
  canEdit,
  onInsertMarkdown,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: attachments, isLoading } = usePageAttachments(pageId);
  const uploadAttachment = useUploadAttachment(pageId);
  const deleteAttachment = useDeleteAttachment(pageId);
  const getDownloadUrl = useAttachmentDownloadUrl();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      try {
        await uploadAttachment.mutateAsync(file);
        toast.success(`Uploaded ${file.name}`);
      } catch (err) {
        toast.error(getApiErrorMessage(err, `Failed to upload ${file.name}`));
      }
    }
  };

  const handleDownload = async (attachmentId: number, filename: string) => {
    try {
      const { url } = await getDownloadUrl.mutateAsync(attachmentId);
      window.open(url, '_blank');
    } catch (err) {
      toast.error(getApiErrorMessage(err, `Failed to download ${filename}`));
    }
  };

  const handleInsertLink = async (
    attachmentId: number,
    filename: string,
    contentType: string,
  ) => {
    try {
      const { url } = await getDownloadUrl.mutateAsync(attachmentId);
      const markdown = contentType.startsWith('image/')
        ? `![${filename}](${url})`
        : `[${filename}](${url})`;
      onInsertMarkdown?.(markdown);
      toast.success('Inserted into editor');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to get download link'));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAttachment.mutateAsync(deleteId);
      toast.success('Attachment deleted');
      setDeleteId(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete attachment'));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
        <Paperclip size={16} />
        Attachments
      </h3>

      {canEdit && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleUpload(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          {uploadAttachment.isPending ? (
            <Loader2 size={20} className="animate-spin mx-auto text-blue-500" />
          ) : (
            <>
              <Upload size={20} className="mx-auto text-slate-400 mb-1" />
              <p className="text-xs text-slate-500">
                Drop files or click to upload
              </p>
            </>
          )}
        </div>
      )}

      {isLoading && (
        <p className="text-sm text-slate-500">Loading attachments...</p>
      )}

      {!isLoading && (!attachments || attachments.length === 0) && (
        <p className="text-sm text-slate-500">No attachments yet.</p>
      )}

      {attachments && attachments.length > 0 && (
        <ul className="space-y-2 max-h-48 overflow-y-auto">
          {attachments.map((att) => (
            <li
              key={att.id}
              className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <FileIcon contentType={att.content_type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {att.original_filename}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(att.size_bytes)} · {formatDate(att.created_at)}
                </p>
              </div>
              <div className="flex gap-0.5 shrink-0">
                {canEdit && onInsertMarkdown && (
                  <button
                    onClick={() =>
                      handleInsertLink(
                        att.id,
                        att.original_filename,
                        att.content_type,
                      )
                    }
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                    title="Insert link"
                  >
                    <Link2 size={14} />
                  </button>
                )}
                <button
                  onClick={() =>
                    handleDownload(att.id, att.original_filename)
                  }
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                  title="Download"
                >
                  <Download size={14} />
                </button>
                {canEdit && (
                  <button
                    onClick={() => setDeleteId(att.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete attachment?"
        description="This file will be permanently removed from the page."
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteAttachment.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
