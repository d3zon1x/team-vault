export interface AuditLog {
  id: number;
  workspace_id: number;
  actor_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  description: string;
  metadata_json: string | null;
  created_at: string;
}

export interface AuditLogFilters {
  action?: string;
  entity_type?: string;
  limit?: number;
  offset?: number;
}
