import { useWorkspaceMembers } from './useWorkspaces';
import { useAuth } from '../context/AuthContext';
import { getMemberRole } from '../lib/utils';
import type { WorkspaceRole } from '../types/workspace';

export function useWorkspaceRole(workspaceId: number): {
  role: WorkspaceRole | null;
  isLoading: boolean;
} {
  const { user } = useAuth();
  const { data: members, isLoading } = useWorkspaceMembers(workspaceId);
  const role = getMemberRole(members ?? [], user?.id);
  return { role, isLoading };
}
