from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.api.dependencies import get_current_user
from app.core.audit_actions import PAGE_CREATED, PAGE_UPDATED, PAGE_PUBLISHED, PAGE_ARCHIVED, PAGE_RESTORED, \
    PAGE_DELETED, PAGE_VERSION_CREATED, PAGE_VERSION_RESTORED
from app.db.dependencies import get_db
from app.models.user import User
from app.repositories.audit_log import create_audit_log
from app.repositories.page import (
    archive_page,
    autosave_page,
    create_page,
    delete_page,
    get_workspace_pages,
    restore_archived_page,
    update_page, search_workspace_pages, count_workspace_pages, count_search_workspace_pages,
)
from app.repositories.page_version import (
    create_page_version,
    get_page_version_by_id,
    get_page_versions,
)
from app.schemas.auth import MessageResponse
from app.schemas.page import (
    PageAutosaveRequest,
    PageCreate,
    PageCreateVersionRequest,
    PageListItemResponse,
    PagePublishRequest,
    PageResponse,
    PageUpdate,
    PageVersionResponse,
)
from app.schemas.pagination import PaginatedResponse
from app.services.pages import (
    create_version_from_page,
    get_page_or_404,
    require_page_read_access,
    require_page_write_access,
    restore_page_from_version,
    validate_page_status, validate_parent_page, validate_new_page_parent,
)
from app.services.workspace_permissions import (
    get_workspace_or_404,
    require_workspace_member,
    require_workspace_role,
)

router = APIRouter(tags=["Pages"])


@router.post(
    "/workspaces/{workspace_id}/pages",
    response_model=PageResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_page_endpoint(
    workspace_id: int,
    payload: PageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_workspace_or_404(db, workspace_id)

    require_workspace_role(
        db,
        workspace_id=workspace_id,
        user=current_user,
        minimum_role="editor",
    )

    validate_page_status(payload.status)

    validate_new_page_parent(
        db,
        workspace_id=workspace_id,
        parent_id=payload.parent_id,
    )

    page = create_page(
        db,
        workspace_id=workspace_id,
        title=payload.title,
        content_markdown=payload.content_markdown,
        parent_id=payload.parent_id,
        status=payload.status,
        position=payload.position,
        user=current_user,
    )

    create_page_version(
        db,
        page=page,
        user=current_user,
        change_message="Initial version",
    )

    create_audit_log(
        db,
        workspace_id=workspace_id,
        actor=current_user,
        action=PAGE_CREATED,
        entity_type="page",
        entity_id=page.id,
        description=f"Created page '{page.title}'",
    )

    db.commit()
    db.refresh(page)

    return page


@router.get(
    "/workspaces/{workspace_id}/pages",
    response_model=PaginatedResponse[PageListItemResponse],
)
def list_workspace_pages(
    workspace_id: int,
    include_archived: bool = False,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_workspace_or_404(db, workspace_id)

    require_workspace_member(
        db,
        workspace_id=workspace_id,
        user=current_user,
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

    items = get_workspace_pages(
        db,
        workspace_id=workspace_id,
        include_archived=include_archived,
        limit=limit,
        offset=offset,
    )

    total = count_workspace_pages(
        db,
        workspace_id=workspace_id,
        include_archived=include_archived,
    )

    return PaginatedResponse[
        PageListItemResponse
    ](
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/workspaces/{workspace_id}/pages/search",
    response_model=PaginatedResponse[PageListItemResponse],
)
def search_pages_endpoint(
    workspace_id: int,
    q: str,
    include_archived: bool = False,
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_workspace_or_404(db, workspace_id)

    require_workspace_member(
        db,
        workspace_id=workspace_id,
        user=current_user,
    )

    if not q.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query cannot be empty",
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

    items = search_workspace_pages(
        db,
        workspace_id=workspace_id,
        query=q,
        include_archived=include_archived,
        limit=limit,
        offset=offset,
    )

    total = count_search_workspace_pages(
        db,
        workspace_id=workspace_id,
        query=q,
        include_archived=include_archived,
    )

    return PaginatedResponse[
        PageListItemResponse
    ](
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )

@router.get("/pages/{page_id}", response_model=PageResponse)
def get_page_endpoint(
    page_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    page = get_page_or_404(db, page_id)

    require_page_read_access(
        db,
        page=page,
        user=current_user,
    )

    return page


@router.patch("/pages/{page_id}", response_model=PageResponse)
def update_page_endpoint(
    page_id: int,
    payload: PageUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    page = get_page_or_404(db, page_id)

    require_page_write_access(
        db,
        page=page,
        user=current_user,
    )

    if payload.status is not None:
        validate_page_status(payload.status)

    validate_parent_page(
        db,
        page=page,
        parent_id=payload.parent_id,
    )

    page = update_page(
        db,
        page,
        title=payload.title,
        content_markdown=payload.content_markdown,
        parent_id=payload.parent_id,
        status=payload.status,
        position=payload.position,
        user=current_user,
    )

    create_version_from_page(
        db,
        page=page,
        user=current_user,
        change_message=payload.change_message or "Updated page",
    )

    create_audit_log(
        db,
        workspace_id=page.workspace_id,
        actor=current_user,
        action=PAGE_UPDATED,
        entity_type="page",
        entity_id=page.id,
        description=f"Updated page '{page.title}'",
        metadata={
            "change_message": payload.change_message,
        },
    )

    db.commit()
    db.refresh(page)

    return page


@router.patch("/pages/{page_id}/autosave", response_model=PageResponse)
def autosave_page_endpoint(
    page_id: int,
    payload: PageAutosaveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    page = get_page_or_404(db, page_id)

    require_page_write_access(
        db,
        page=page,
        user=current_user,
    )

    return autosave_page(
        db,
        page,
        title=payload.title,
        content_markdown=payload.content_markdown,
        user=current_user,
    )


@router.post("/pages/{page_id}/publish", response_model=PageResponse)
def publish_page_endpoint(
    page_id: int,
    payload: PagePublishRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    page = get_page_or_404(db, page_id)

    require_page_write_access(
        db,
        page=page,
        user=current_user,
    )

    page = update_page(
        db,
        page,
        status="published",
        user=current_user,
    )

    create_version_from_page(
        db,
        page=page,
        user=current_user,
        change_message=payload.change_message or "Published page",
    )

    create_audit_log(
        db,
        workspace_id=page.workspace_id,
        actor=current_user,
        action=PAGE_PUBLISHED,
        entity_type="page",
        entity_id=page.id,
        description=f"Published page '{page.title}'",
        metadata={
            "change_message": payload.change_message,
        },
    )

    db.commit()
    db.refresh(page)

    return page


@router.post("/pages/{page_id}/archive", response_model=PageResponse)
def archive_page_endpoint(
    page_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    page = get_page_or_404(db, page_id)

    require_page_write_access(
        db,
        page=page,
        user=current_user,
    )

    page = archive_page(
        db,
        page,
        user=current_user,
    )

    create_version_from_page(
        db,
        page=page,
        user=current_user,
        change_message="Archived page",
    )

    create_audit_log(
        db,
        workspace_id=page.workspace_id,
        actor=current_user,
        action=PAGE_ARCHIVED,
        entity_type="page",
        entity_id=page.id,
        description=f"Archived page '{page.title}'",
    )

    db.commit()
    db.refresh(page)

    return page


@router.post("/pages/{page_id}/restore", response_model=PageResponse)
def restore_archived_page_endpoint(
    page_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    page = get_page_or_404(db, page_id)

    require_page_write_access(
        db,
        page=page,
        user=current_user,
    )

    page = restore_archived_page(
        db,
        page,
        user=current_user,
    )

    create_version_from_page(
        db,
        page=page,
        user=current_user,
        change_message="Restored archived page",
    )

    create_audit_log(
        db,
        workspace_id=page.workspace_id,
        actor=current_user,
        action=PAGE_RESTORED,
        entity_type="page",
        entity_id=page.id,
        description=f"Restored archived page '{page.title}'",
    )

    db.commit()
    db.refresh(page)

    return page


@router.delete("/pages/{page_id}", response_model=MessageResponse)
def delete_page_endpoint(
    page_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    page = get_page_or_404(db, page_id)

    require_workspace_role(
        db,
        workspace_id=page.workspace_id,
        user=current_user,
        minimum_role="admin",
    )

    create_audit_log(
        db,
        workspace_id=page.workspace_id,
        actor=current_user,
        action=PAGE_DELETED,
        entity_type="page",
        entity_id=page.id,
        description=f"Deleted page '{page.title}'",
    )

    delete_page(db, page)

    return MessageResponse(message="Page deleted successfully")


@router.post(
    "/pages/{page_id}/versions",
    response_model=PageVersionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_page_version_endpoint(
    page_id: int,
    payload: PageCreateVersionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    page = get_page_or_404(db, page_id)

    require_page_write_access(
        db,
        page=page,
        user=current_user,
    )

    version = create_version_from_page(
        db,
        page=page,
        user=current_user,
        change_message=payload.change_message,
    )

    create_audit_log(
        db,
        workspace_id=page.workspace_id,
        actor=current_user,
        action=PAGE_PUBLISHED,
        entity_type="page",
        entity_id=page.id,
        description=f"Published page '{page.title}'",
        metadata={
            "change_message": payload.change_message,
        },
    )

    create_audit_log(
        db,
        workspace_id=page.workspace_id,
        actor=current_user,
        action=PAGE_VERSION_CREATED,
        entity_type="page_version",
        entity_id=version.id,
        description=f"Created version {version.version_number} for page '{page.title}'",
        metadata={
            "page_id": page.id,
            "change_message": payload.change_message,
        },
    )

    db.commit()
    db.refresh(version)

    return version


@router.get(
    "/pages/{page_id}/versions",
    response_model=list[PageVersionResponse],
)
def list_page_versions(
    page_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    page = get_page_or_404(db, page_id)

    require_page_read_access(
        db,
        page=page,
        user=current_user,
    )

    return get_page_versions(db, page_id)


@router.get(
    "/pages/{page_id}/versions/{version_id}",
    response_model=PageVersionResponse,
)
def get_page_version_endpoint(
    page_id: int,
    version_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    page = get_page_or_404(db, page_id)

    require_page_read_access(
        db,
        page=page,
        user=current_user,
    )

    version = get_page_version_by_id(
        db,
        page_id=page_id,
        version_id=version_id,
    )

    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page version not found",
        )

    return version


@router.post(
    "/pages/{page_id}/versions/{version_id}/restore",
    response_model=PageResponse,
)
def restore_page_version_endpoint(
    page_id: int,
    version_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    page = get_page_or_404(db, page_id)

    require_page_write_access(
        db,
        page=page,
        user=current_user,
    )

    version = get_page_version_by_id(
        db,
        page_id=page_id,
        version_id=version_id,
    )

    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page version not found",
        )

    create_audit_log(
        db,
        workspace_id=page.workspace_id,
        actor=current_user,
        action=PAGE_VERSION_RESTORED,
        entity_type="page_version",
        entity_id=version.id,
        description=f"Restored page '{page.title}' from version {version.version_number}",
        metadata={
            "page_id": page.id,
            "version_number": version.version_number,
        },
    )

    return restore_page_from_version(
        db,
        page=page,
        version=version,
        user=current_user,
    )