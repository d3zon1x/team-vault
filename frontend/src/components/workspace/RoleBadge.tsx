import React from 'react';
import type { WorkspaceRole } from '../../types/workspace';
import { cn } from '../../lib/utils';

const roleStyles: Record<WorkspaceRole, string> = {
  owner: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  admin: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  editor: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  viewer: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

interface RoleBadgeProps {
  role: WorkspaceRole;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className }) => (
  <span
    className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
      roleStyles[role],
      className,
    )}
  >
    {role}
  </span>
);
