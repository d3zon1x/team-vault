from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.workspace_member import WorkspaceMember


class WorkspaceCreate(BaseModel):
    name: str
    description: str | None = None


class WorkspaceUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class WorkspaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    description: str | None
    created_at: datetime
    updated_at: datetime


class WorkspaceMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workspace_id: int
    user_id: int
    username: str
    email: str
    role: str
    created_at: datetime


class AddWorkspaceMemberRequest(BaseModel):
    email: str
    role: str = "viewer"


class UpdateWorkspaceMemberRoleRequest(BaseModel):
    role: str


def workspace_member_to_response(member: WorkspaceMember) -> WorkspaceMemberResponse:
    return WorkspaceMemberResponse(
        id=member.id,
        workspace_id=member.workspace_id,
        user_id=member.user_id,
        username=member.user.username,
        email=member.user.email,
        role=member.role,
        created_at=member.created_at,
    )