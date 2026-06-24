from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AttachmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workspace_id: int
    page_id: int
    uploaded_by_id: int
    original_filename: str
    stored_filename: str
    s3_key: str
    content_type: str
    size_bytes: int
    created_at: datetime


class AttachmentDownloadUrlResponse(BaseModel):
    url: str
    expires_in: int