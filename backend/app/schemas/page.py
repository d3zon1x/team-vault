from datetime import datetime
from pydantic import BaseModel, ConfigDict


class PageCreate(BaseModel):
    title: str
    content_markdown: str = ""
    parent_id: int | None = None
    status: str = "draft"
    position: int = 0


class PageUpdate(BaseModel):
    title: str | None = None
    content_markdown: str | None = None
    parent_id: int | None = None
    status: str | None = None
    position: int | None = None
    change_message: str | None = None


class PageAutosaveRequest(BaseModel):
    title: str | None = None
    content_markdown: str | None = None


class PagePublishRequest(BaseModel):
    change_message: str | None = None


class PageCreateVersionRequest(BaseModel):
    change_message: str | None = None


class PageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workspace_id: int
    parent_id: int | None
    title: str
    slug: str
    content_markdown: str
    status: str
    position: int
    created_by_id: int
    updated_by_id: int | None
    archived_at: datetime | None
    created_at: datetime
    updated_at: datetime


class PageListItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workspace_id: int
    parent_id: int | None
    title: str
    slug: str
    status: str
    position: int
    updated_at: datetime


class PageVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    page_id: int
    version_number: int
    title: str
    content_markdown: str
    status: str
    change_message: str | None
    created_by_id: int
    created_at: datetime

