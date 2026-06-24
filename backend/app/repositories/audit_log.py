import json
from typing import Any

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.user import User


def create_audit_log(
    db: Session,
    *,
    workspace_id: int,
    actor: User | None,
    action: str,
    entity_type: str,
    entity_id: int | None = None,
    description: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> AuditLog:
    audit_log = AuditLog(
        workspace_id=workspace_id,
        actor_id=actor.id if actor else None,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        description=description,
        metadata_json=json.dumps(metadata) if metadata else None,
    )

    db.add(audit_log)
    db.flush()

    return audit_log


def get_workspace_audit_logs(
    db: Session,
    *,
    workspace_id: int,
    limit: int = 50,
    offset: int = 0,
    action: str | None = None,
    entity_type: str | None = None,
) -> list[AuditLog]:
    statement = select(AuditLog).where(
        AuditLog.workspace_id == workspace_id,
    )

    if action:
        statement = statement.where(AuditLog.action == action)

    if entity_type:
        statement = statement.where(AuditLog.entity_type == entity_type)

    statement = (
        statement
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
        .offset(offset)
    )

    return list(db.execute(statement).scalars().all())


def count_workspace_audit_logs(
    db: Session,
    *,
    workspace_id: int,
    action: str | None = None,
    entity_type: str | None = None,
) -> int:
    statement = select(func.count(AuditLog.id)).where(
        AuditLog.workspace_id == workspace_id,
    )

    if action:
        statement = statement.where(AuditLog.action == action)

    if entity_type:
        statement = statement.where(AuditLog.entity_type == entity_type)

    return db.execute(statement).scalar_one()