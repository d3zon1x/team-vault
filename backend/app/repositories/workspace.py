from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.slug import slugify
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember


def create_workspace(
    db: Session,
    *,
    name: str,
    description: str | None,
    owner: User,
) -> Workspace:
    base_slug = slugify(name)
    slug = base_slug
    counter = 1

    while get_workspace_by_slug(db, slug):
        counter += 1
        slug = f"{base_slug}-{counter}"

    workspace = Workspace(
        name=name,
        slug=slug,
        description=description,
    )

    db.add(workspace)
    db.flush()

    member = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=owner.id,
        role="owner",
    )

    db.add(member)
    db.commit()
    db.refresh(workspace)

    return workspace


def get_workspace_by_id(db: Session, workspace_id: int) -> Workspace | None:
    statement = select(Workspace).where(Workspace.id == workspace_id)
    return db.execute(statement).scalar_one_or_none()


def get_workspace_by_slug(db: Session, slug: str) -> Workspace | None:
    statement = select(Workspace).where(Workspace.slug == slug)
    return db.execute(statement).scalar_one_or_none()


def get_user_workspaces(db: Session, user_id: int) -> list[Workspace]:
    statement = (
        select(Workspace)
        .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
        .where(WorkspaceMember.user_id == user_id)
        .order_by(Workspace.created_at.desc())
    )

    return list(db.execute(statement).scalars().all())


def update_workspace(
    db: Session,
    workspace: Workspace,
    *,
    name: str | None = None,
    description: str | None = None,
) -> Workspace:
    if name is not None:
        workspace.name = name

    if description is not None:
        workspace.description = description

    db.commit()
    db.refresh(workspace)

    return workspace


def delete_workspace(db: Session, workspace: Workspace) -> None:
    db.delete(workspace)
    db.commit()