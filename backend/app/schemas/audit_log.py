from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workspace_id: int
    actor_id: int | None
    action: str
    entity_type: str
    entity_id: int | None
    description: str | None
    metadata_json: str | None
    created_at: datetime


class AuditLogCreate(BaseModel):
    workspace_id: int
    actor_id: int | None
    action: str
    entity_type: str
    entity_id: int | None = None
    description: str | None = None
    metadata: dict[str, Any] | None = None