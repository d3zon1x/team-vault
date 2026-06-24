export type PageStatus = 'draft' | 'published' | 'archived';

export interface Page {
  id: number;
  workspace_id: number;
  parent_id: number | null;
  title: string;
  slug: string;
  content_markdown: string;
  status: PageStatus;
  position: number;
  created_by_id: number;
  updated_by_id: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PageListItem {
  id: number;
  workspace_id: number;
  parent_id: number | null;
  title: string;
  slug: string;
  status: PageStatus;
  position: number;
  updated_at: string;
}

export interface PageVersion {
  id: number;
  page_id: number;
  version_number: number;
  title: string;
  content_markdown: string;
  status: PageStatus;
  change_message: string | null;
  created_by_id: number;
  created_at: string;
}

export interface CreatePageBody {
  title: string;
  content_markdown?: string;
  parent_id?: number | null;
  status?: PageStatus;
  position?: number;
}

export interface UpdatePageBody {
  title?: string | null;
  content_markdown?: string | null;
  parent_id?: number | null;
  status?: PageStatus | null;
  position?: number | null;
  change_message?: string | null;
}

export interface PageAutosaveBody {
  title?: string | null;
  content_markdown?: string | null;
}

export interface CreatePageVersionBody {
  change_message?: string | null;
}

export interface PagePublishBody {
  change_message?: string | null;
}

export interface PageTreeNode extends PageListItem {
  children: PageTreeNode[];
}
