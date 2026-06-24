import React from 'react';
import { Loader2, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <h3 className="text-lg font-semibold text-slate-900 pr-8">{title}</h3>
        <p className="text-sm text-slate-500 mt-2">{description}</p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50',
              variant === 'danger'
                ? 'bg-red-600 text-white hover:bg-red-500'
                : 'bg-blue-600 text-white hover:bg-blue-500',
            )}
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
