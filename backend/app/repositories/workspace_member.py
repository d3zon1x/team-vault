from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.workspace_member import WorkspaceMember


def get_workspace_member(
    db: Session,
    *,
    workspace_id: int,
    user_id: int,
) -> WorkspaceMember | None:
    statement = select(WorkspaceMember).where(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.user_id == user_id,
    )

    return db.execute(statement).scalar_one_or_none()


def get_workspace_members(
    db: Session,
    workspace_id: int,
) -> list[WorkspaceMember]:
    statement = (
        select(WorkspaceMember)
        .options(joinedload(WorkspaceMember.user))
        .where(WorkspaceMember.workspace_id == workspace_id)
        .order_by(WorkspaceMember.created_at.asc())
    )

    return list(db.execute(statement).scalars().all())

def get_workspace_member_by_id(
    db: Session,
    *,
    workspace_id: int,
    member_id: int,
) -> WorkspaceMember | None:
    statement = select(WorkspaceMember).options(
        joinedload(WorkspaceMember.user),
    ).where(
        WorkspaceMember.workspace_id == workspace_id,
        WorkspaceMember.id == member_id,
    )

    return db.execute(statement).scalar_one_or_none()


def add_workspace_member(
    db: Session,
    *,
    workspace_id: int,
    user_id: int,
    role: str,
) -> WorkspaceMember:
    member = WorkspaceMember(
        workspace_id=workspace_id,
        user_id=user_id,
        role=role,
    )

    db.add(member)
    db.commit()
    db.refresh(member)

    return member


def update_workspace_member_role(
    db: Session,
    member: WorkspaceMember,
    role: str,
) -> WorkspaceMember:
    member.role = role

    db.commit()
    db.refresh(member)

    return member


def remove_workspace_member(
    db: Session,
    member: WorkspaceMember,
) -> None:
    db.delete(member)
    db.commit()