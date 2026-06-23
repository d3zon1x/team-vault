from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.repositories.workspace import get_workspace_by_id
from app.repositories.workspace_member import get_workspace_member


VALID_WORKSPACE_ROLES = {"owner", "admin", "editor", "viewer"}
ASSIGNABLE_WORKSPACE_ROLES = {"admin", "editor", "viewer"}

ROLE_LEVELS = {
    "viewer": 1,
    "editor": 2,
    "admin": 3,
    "owner": 4,
}

def validate_assignable_workspace_role(role: str) -> None:
    if role not in ASSIGNABLE_WORKSPACE_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This workspace role cannot be assigned",
        )

def validate_workspace_role(role: str) -> None:
    if role not in VALID_WORKSPACE_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid workspace role",
        )


def get_workspace_or_404(db: Session, workspace_id: int) -> Workspace:
    workspace = get_workspace_by_id(db, workspace_id)

    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found",
        )

    return workspace


def require_workspace_member(
    db: Session,
    *,
    workspace_id: int,
    user: User,
) -> WorkspaceMember:
    member = get_workspace_member(
        db,
        workspace_id=workspace_id,
        user_id=user.id,
    )

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this workspace",
        )

    return member


def require_workspace_role(
    db: Session,
    *,
    workspace_id: int,
    user: User,
    minimum_role: str,
) -> WorkspaceMember:
    validate_workspace_role(minimum_role)

    member = require_workspace_member(
        db,
        workspace_id=workspace_id,
        user=user,
    )

    if ROLE_LEVELS[member.role] < ROLE_LEVELS[minimum_role]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action",
        )

    return member