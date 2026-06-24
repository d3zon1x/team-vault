import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { PageListItem, PageTreeNode } from '../types/page';
import type { WorkspaceRole } from '../types/workspace';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong',
): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as {
      response?: {
        data?: {
          detail?: unknown;
          message?: string;
          error?: { message?: string; details?: unknown };
        };
      };
    }).response?.data;

    if (typeof data?.error?.message === 'string') return data.error.message;
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.detail === 'string') return data.detail;
    if (Array.isArray(data?.detail)) {
      return (
        data.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(', ') ||
        fallback
      );
    }
  }
  return fallback;
}

export function buildPageTree(pages: PageListItem[]): PageTreeNode[] {
  const map = new Map<number, PageTreeNode>();
  const roots: PageTreeNode[] = [];

  for (const page of pages) {
    map.set(page.id, { ...page, children: [] });
  }

  for (const page of pages) {
    const node = map.get(page.id)!;
    if (page.parent_id !== null && map.has(page.parent_id)) {
      map.get(page.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: PageTreeNode[]) => {
    nodes.sort((a, b) => a.position - b.position);
    nodes.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);
  return roots;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateString);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function canEditWorkspace(role: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

export function canDeleteWorkspace(role: WorkspaceRole | null): boolean {
  return role === 'owner';
}

export function canManageMembers(role: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

export function canEditDocuments(role: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'editor';
}

export function canDeletePage(role: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin';
}

export function getMemberRole(
  members: { user_id: number; role: WorkspaceRole }[],
  userId: string | number | undefined,
): WorkspaceRole | null {
  if (userId === undefined || userId === null) return null;
  const normalizedUserId = String(userId);
  const member = members.find((m) => String(m.user_id) === normalizedUserId);
  return member?.role ?? null;
}

export function isSameUser(
  userId: string | number | undefined,
  memberUserId: number,
): boolean {
  if (userId === undefined || userId === null) return false;
  return String(userId) === String(memberUserId);
}
