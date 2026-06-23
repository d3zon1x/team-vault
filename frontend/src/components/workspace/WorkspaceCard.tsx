import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, ChevronRight } from 'lucide-react';
import type { Workspace } from '../../types/workspace';
import { formatDate } from '../../lib/utils';

interface WorkspaceCardProps {
  workspace: Workspace;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({ workspace }) => (
  <Link
    to={`/workspaces/${workspace.id}`}
    className="group block p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/40 hover:bg-slate-800/80 transition-all"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
          <FolderOpen className="text-blue-400" size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
            {workspace.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">/{workspace.slug}</p>
        </div>
      </div>
      <ChevronRight
        className="text-slate-600 group-hover:text-blue-400 transition-colors shrink-0 mt-1"
        size={18}
      />
    </div>
    {workspace.description && (
      <p className="text-sm text-slate-400 mt-3 line-clamp-2">
        {workspace.description}
      </p>
    )}
    <p className="text-xs text-slate-500 mt-3">
      Created {formatDate(workspace.created_at)}
    </p>
  </Link>
);
