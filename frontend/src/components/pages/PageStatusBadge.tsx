import React from 'react';
import type { PageStatus } from '../../types/page';
import { cn } from '../../lib/utils';

const statusStyles: Record<PageStatus, string> = {
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  archived: 'bg-slate-100 text-slate-600 border-slate-200',
};

interface PageStatusBadgeProps {
  status: PageStatus;
  className?: string;
}

export const PageStatusBadge: React.FC<PageStatusBadgeProps> = ({
  status,
  className,
}) => (
  <span
    className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize',
      statusStyles[status],
      className,
    )}
  >
    {status}
  </span>
);
