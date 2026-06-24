import React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse rounded-md bg-slate-200', className)} />
);

export const PageListSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl"
      >
        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="p-5 bg-white border border-slate-200 rounded-xl space-y-3"
      >
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-12" />
      </div>
    ))}
  </div>
);
