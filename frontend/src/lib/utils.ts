import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
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
    const data = (error as { response?: { data?: { detail?: unknown; message?: string } } })
      .response?.data;
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.detail === 'string') return data.detail;
    if (Array.isArray(data?.detail)) {
      return data.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(', ') || fallback;
    }
  }
  return fallback;
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

/** Reserved for future document operations */
export function canEditDocuments(role: WorkspaceRole | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'editor';
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
