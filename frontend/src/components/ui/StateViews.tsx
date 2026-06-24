import React from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center py-16 text-slate-500',
      className,
    )}
  >
    <Loader2 className="animate-spin text-blue-500 mb-3" size={36} />
    <p className="text-sm">{message}</p>
  </div>
);

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center py-16 text-center px-4',
      className,
    )}
  >
    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
      <AlertCircle className="text-red-400" size={24} />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm max-w-md mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
      >
        Try again
      </button>
    )}
  </div>
);

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center py-16 text-center px-4',
      className,
    )}
  >
    <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
      {icon ?? <Inbox className="text-slate-400" size={28} />}
    </div>
    <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm max-w-md mb-6">{description}</p>
    {action}
  </div>
);
