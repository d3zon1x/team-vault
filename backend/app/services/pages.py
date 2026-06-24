from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.page import Page
from app.models.page_version import PageVersion
from app.models.user import User
from app.repositories.page import get_page_by_id, update_page
from app.repositories.page_version import create_page_version
from app.services.workspace_permissions import require_workspace_member, require_workspace_role


VALID_PAGE_STATUSES = {"draft", "published", "archived"}


def validate_page_status(page_status: str) -> None:
    if page_status not in VALID_PAGE_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid page status",
        )


def get_page_or_404(db: Session, page_id: int) -> Page:
    page = get_page_by_id(db, page_id)

    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Page not found",
        )

    return page


def require_page_read_access(
    db: Session,
    *,
    page: Page,
    user: User,
) -> None:
    require_workspace_member(
        db,
        workspace_id=page.workspace_id,
        user=user,
    )


def require_page_write_access(
    db: Session,
    *,
    page: Page,
    user: User,
) -> None:
    require_workspace_role(
        db,
        workspace_id=page.workspace_id,
        user=user,
        minimum_role="editor",
    )


def create_version_from_page(
    db: Session,
    *,
    page: Page,
    user: User,
    change_message: str | None,
) -> PageVersion:
    return create_page_version(
        db,
        page=page,
        user=user,
        change_message=change_message,
    )


def restore_page_from_version(
    db: Session,
    *,
    page: Page,
    version: PageVersion,
    user: User,
) -> Page:
    page = update_page(
        db,
        page,
        title=version.title,
        content_markdown=version.content_markdown,
        status=version.status,
        user=user,
    )

    create_page_version(
        db,
        page=page,
        user=user,
        change_message=f"Restored from version {version.version_number}",
    )

    db.commit()
    db.refresh(page)

    return page


def validate_parent_page(
    db: Session,
    *,
    page: Page,
    parent_id: int | None,
) -> None:
    if parent_id is None:
        return

    if parent_id == page.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page cannot be its own parent",
        )

    current_parent_id = parent_id

    while current_parent_id is not None:
        parent = get_page_by_id(db, current_parent_id)

        if not parent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent page not found",
            )

        if parent.workspace_id != page.workspace_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent page must belong to the same workspace",
            )

        if parent.parent_id == page.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Circular page hierarchy is not allowed",
            )

        current_parent_id = parent.parent_id


def validate_new_page_parent(
    db: Session,
    *,
    workspace_id: int,
    parent_id: int | None,
) -> None:
    if parent_id is None:
        return

    parent = get_page_by_id(db, parent_id)

    if not parent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parent page not found",
        )

    if parent.workspace_id != workspace_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parent page must belong to the same workspace",
        )