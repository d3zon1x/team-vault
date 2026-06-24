export interface Attachment {
  id: number;
  workspace_id: number;
  page_id: number;
  uploaded_by_id: number;
  original_filename: string;
  stored_filename: string;
  s3_key: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
}

export interface AttachmentDownloadUrl {
  url: string;
  expires_in: number;
}
