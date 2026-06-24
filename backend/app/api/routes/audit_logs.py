from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.api.dependencies import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.repositories.audit_log import get_workspace_audit_logs, count_workspace_audit_logs
from app.schemas.audit_log import AuditLogResponse
from app.schemas.pagination import PaginatedResponse
from app.services.workspace_permissions import (
    get_workspace_or_404,
    require_workspace_role,
)

router = APIRouter(tags=["Audit Logs"])


@router.get(
    "/workspaces/{workspace_id}/audit-logs",
    response_model=PaginatedResponse[AuditLogResponse],
)
def list_workspace_audit_logs(
    workspace_id: int,
    limit: int = 50,
    offset: int = 0,
    action: str | None = None,
    entity_type: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_workspace_or_404(db, workspace_id)

    require_workspace_role(
        db,
        workspace_id=workspace_id,
        user=current_user,
        minimum_role="admin",
    )

    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 100",
        )

    if offset < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Offset cannot be negative",
        )

    items = get_workspace_audit_logs(
        db,
        workspace_id=workspace_id,
        limit=limit,
        offset=offset,
        action=action,
        entity_type=entity_type,
    )

    total = count_workspace_audit_logs(
        db,
        workspace_id=workspace_id,
        action=action,
        entity_type=entity_type,
    )

    return PaginatedResponse[
        AuditLogResponse
    ](
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )