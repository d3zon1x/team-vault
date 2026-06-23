export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export type AssignableWorkspaceRole = 'admin' | 'editor' | 'viewer';

export interface Workspace {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: number;
  workspace_id: number;
  user_id: number;
  username: string;
  email: string;
  role: WorkspaceRole;
  created_at: string;
}

export interface CreateWorkspaceBody {
  name: string;
  description?: string;
}

export interface UpdateWorkspaceBody {
  name?: string;
  description?: string | null;
}

export interface AddMemberBody {
  email: string;
  role: AssignableWorkspaceRole;
}

export interface UpdateMemberRoleBody {
  role: AssignableWorkspaceRole;
}

export interface MessageResponse {
  message: string;
}
