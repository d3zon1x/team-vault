import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText } from 'lucide-react';
import type { PageTreeNode } from '../../types/page';
import { cn } from '../../lib/utils';
import { PageStatusBadge } from './PageStatusBadge';

interface PageTreeProps {
  nodes: PageTreeNode[];
  workspaceId: number;
  activePageId?: number;
  compact?: boolean;
  className?: string;
}

const TreeNode: React.FC<{
  node: PageTreeNode;
  workspaceId: number;
  activePageId?: number;
  compact?: boolean;
  depth?: number;
}> = ({ node, workspaceId, activePageId, compact, depth = 0 }) => {
  const isActive = activePageId === node.id;

  return (
    <div>
      <Link
        to={`/workspaces/${workspaceId}/pages/${node.id}`}
        className={cn(
          'flex items-center gap-2 rounded-lg transition-colors group',
          compact ? 'px-2 py-1.5 text-sm' : 'px-3 py-2',
          isActive
            ? 'bg-blue-50 text-blue-700 font-medium'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
        )}
        style={{ paddingLeft: `${(depth + 1) * (compact ? 8 : 12)}px` }}
      >
        <FileText
          size={compact ? 14 : 16}
          className={cn(
            'shrink-0',
            isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500',
          )}
        />
        <span className="truncate flex-1">{node.title}</span>
        {!compact && <PageStatusBadge status={node.status} />}
        {compact && isActive && <ChevronRight size={14} className="shrink-0" />}
      </Link>
      {node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              workspaceId={workspaceId}
              activePageId={activePageId}
              compact={compact}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const PageTree: React.FC<PageTreeProps> = ({
  nodes,
  workspaceId,
  activePageId,
  compact,
  className,
}) => {
  if (nodes.length === 0) {
    return (
      <p className={cn('text-sm text-slate-500 px-3 py-4', className)}>
        No pages yet
      </p>
    );
  }

  return (
    <nav className={cn('space-y-0.5', className)}>
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          workspaceId={workspaceId}
          activePageId={activePageId}
          compact={compact}
        />
      ))}
    </nav>
  );
};
