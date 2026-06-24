from http.client import HTTPException

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.api.dependencies import get_current_user
from app.core.audit_actions import WORKSPACE_CREATED, WORKSPACE_UPDATED, WORKSPACE_DELETED, MEMBER_ROLE_UPDATED, \
    MEMBER_REMOVED, MEMBER_ADDED
from app.db.dependencies import get_db
from app.models.user import User
from app.repositories.audit_log import create_audit_log
from app.repositories.workspace import (
    create_workspace,
    delete_workspace,
    get_user_workspaces,
    update_workspace,
)
from app.schemas.auth import MessageResponse
from app.schemas.workspace import (
    WorkspaceCreate,
    WorkspaceResponse,
    WorkspaceUpdate,
)
from app.services.workspace_permissions import (
    get_workspace_or_404,
    require_workspace_member,
    require_workspace_role, validate_assignable_workspace_role,
)
from app.repositories.user import get_user_by_email
from app.repositories.workspace_member import (
    add_workspace_member,
    get_workspace_member,
    get_workspace_members,
    remove_workspace_member,
    update_workspace_member_role, get_workspace_member_by_id,
)
from app.schemas.workspace import (
    AddWorkspaceMemberRequest,
    UpdateWorkspaceMemberRoleRequest,
    WorkspaceMemberResponse,
    workspace_member_to_response,
)
from app.services.workspace_permissions import validate_workspace_role

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])


@router.post(
    "",
    response_model=WorkspaceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_workspace_endpoint(
    payload: WorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workspace = create_workspace(
        db,
        name=payload.name,
        description=payload.description,
        owner=current_user,
    )

    create_audit_log(
        db,
        workspace_id=workspace.id,
        actor=current_user,
        action=WORKSPACE_CREATED,
        entity_type="workspace",
        entity_id=workspace.id,
        description=f"Created workspace '{workspace.name}'",
    )

    db.commit()
    db.refresh(workspace)

    return workspace


@router.get("", response_model=list[WorkspaceResponse])
def list_workspaces(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_user_workspaces(db, current_user.id)


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
def get_workspace(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workspace = get_workspace_or_404(db, workspace_id)

    require_workspace_member(
        db,
        workspace_id=workspace_id,
        user=current_user,
    )

    return workspace


@router.patch("/{workspace_id}", response_model=WorkspaceResponse)
def update_workspace_endpoint(
    workspace_id: int,
    payload: WorkspaceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workspace = get_workspace_or_404(db, workspace_id)

    require_workspace_role(
        db,
        workspace_id=workspace_id,
        user=current_user,
        minimum_role="admin",
    )

    create_audit_log(
        db,
        workspace_id=workspace.id,
        actor=current_user,
        action=WORKSPACE_UPDATED,
        entity_type="workspace",
        entity_id=workspace.id,
        description=f"Updated workspace '{workspace.name}'",
        metadata={
            "name": payload.name,
            "description": payload.description,
        },
    )

    db.commit()
    db.refresh(workspace)

    return update_workspace(
        db,
        workspace,
        name=payload.name,
        description=payload.description,
    )


@router.delete("/{workspace_id}", response_model=MessageResponse)
def delete_workspace_endpoint(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    workspace = get_workspace_or_404(db, workspace_id)

    require_workspace_role(
        db,
        workspace_id=workspace_id,
        user=current_user,
        minimum_role="owner",
    )

    create_audit_log(
        db,
        workspace_id=workspace.id,
        actor=current_user,
        action=WORKSPACE_DELETED,
        entity_type="workspace",
        entity_id=workspace.id,
        description=f"Deleted workspace '{workspace.name}'",
    )

    db.commit()

    delete_workspace(db, workspace)

    return MessageResponse(message="Workspace deleted successfully")

@router.get(
    "/{workspace_id}/members",
    response_model=list[WorkspaceMemberResponse],
)
def list_workspace_members(
    workspace_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_workspace_or_404(db, workspace_id)

    require_workspace_member(
        db,
        workspace_id=workspace_id,
        user=current_user,
    )

    return [
        workspace_member_to_response(member)
        for member in get_workspace_members(db, workspace_id)
    ]


@router.post(
    "/{workspace_id}/members",
    response_model=WorkspaceMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_member_to_workspace(
    workspace_id: int,
    payload: AddWorkspaceMemberRequest,
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

    validate_assignable_workspace_role(payload.role)

    user_to_add = get_user_by_email(db, payload.email)

    if not user_to_add:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    existing_member = get_workspace_member(
        db,
        workspace_id=workspace_id,
        user_id=user_to_add.id,
    )

    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a workspace member",
        )

    member = add_workspace_member(
        db,
        workspace_id=workspace_id,
        user_id=user_to_add.id,
        role=payload.role,
    )

    create_audit_log(
        db,
        workspace_id=workspace_id,
        actor=current_user,
        action=MEMBER_ADDED,
        entity_type="workspace_member",
        entity_id=member.id,
        description=f"Added user {user_to_add.email} as {payload.role}",
        metadata={
            "user_id": user_to_add.id,
            "email": user_to_add.email,
            "role": payload.role,
        },
    )

    db.commit()
    db.refresh(member)

    return workspace_member_to_response(member)


@router.patch(
    "/{workspace_id}/members/{member_id}",
    response_model=WorkspaceMemberResponse,
)
def update_member_role(
    workspace_id: int,
    member_id: int,
    payload: UpdateWorkspaceMemberRoleRequest,
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

    validate_assignable_workspace_role(payload.role)

    member = get_workspace_member_by_id(
        db,
        workspace_id=workspace_id,
        member_id=member_id,
    )

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace member not found",
        )

    if member.role == "owner":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Owner role cannot be changed",
        )

    member = update_workspace_member_role(db, member, payload.role)

    create_audit_log(
        db,
        workspace_id=workspace_id,
        actor=current_user,
        action=MEMBER_ROLE_UPDATED,
        entity_type="workspace_member",
        entity_id=member.id,
        description=f"Updated member role to {payload.role}",
        metadata={
            "member_id": member.id,
            "user_id": member.user_id,
            "new_role": payload.role,
        },
    )

    db.commit()
    db.refresh(member)

    return workspace_member_to_response(member)


@router.delete(
    "/{workspace_id}/members/{member_id}",
    response_model=MessageResponse,
)
def remove_member_from_workspace(
    workspace_id: int,
    member_id: int,
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

    member = get_workspace_member_by_id(
        db,
        workspace_id=workspace_id,
        member_id=member_id,
    )

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace member not found",
        )

    if member.role == "owner":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Owner cannot be removed from workspace",
        )

    create_audit_log(
        db,
        workspace_id=workspace_id,
        actor=current_user,
        action=MEMBER_REMOVED,
        entity_type="workspace_member",
        entity_id=member.id,
        description="Removed workspace member",
        metadata={
            "member_id": member.id,
            "user_id": member.user_id,
            "role": member.role,
        },
    )

    db.commit()

    remove_workspace_member(db, member)

    return MessageResponse(message="Workspace member removed successfully")