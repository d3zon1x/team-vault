from datetime import datetime, timezone

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.slug import slugify
from app.models.page import Page
from app.models.user import User


def get_page_by_id(db: Session, page_id: int) -> Page | None:
    statement = select(Page).where(Page.id == page_id)
    return db.execute(statement).scalar_one_or_none()


def get_page_by_slug(
    db: Session,
    *,
    workspace_id: int,
    slug: str,
) -> Page | None:
    statement = select(Page).where(
        Page.workspace_id == workspace_id,
        Page.slug == slug,
    )
    return db.execute(statement).scalar_one_or_none()


def get_workspace_pages(
    db: Session,
    *,
    workspace_id: int,
    include_archived: bool = False,
    limit: int = 50,
    offset: int = 0,
) -> list[Page]:
    statement = select(Page).where(Page.workspace_id == workspace_id)

    if not include_archived:
        statement = statement.where(Page.status != "archived")

    statement = (
        statement
        .order_by(Page.position.asc(), Page.created_at.asc())
        .limit(limit)
        .offset(offset)
    )

    return list(db.execute(statement).scalars().all())


def create_page(
    db: Session,
    *,
    workspace_id: int,
    title: str,
    content_markdown: str,
    parent_id: int | None,
    status: str,
    position: int,
    user: User,
) -> Page:
    base_slug = slugify(title)
    slug = base_slug
    counter = 1

    while get_page_by_slug(db, workspace_id=workspace_id, slug=slug):
        counter += 1
        slug = f"{base_slug}-{counter}"

    page = Page(
        workspace_id=workspace_id,
        parent_id=parent_id,
        title=title,
        slug=slug,
        content_markdown=content_markdown,
        status=status,
        position=position,
        created_by_id=user.id,
        updated_by_id=user.id,
    )

    db.add(page)
    db.flush()

    return page


def update_page(
    db: Session,
    page: Page,
    *,
    title: str | None = None,
    content_markdown: str | None = None,
    parent_id: int | None = None,
    status: str | None = None,
    position: int | None = None,
    user: User,
) -> Page:
    if title is not None:
        page.title = title

    if content_markdown is not None:
        page.content_markdown = content_markdown

    if parent_id is not None:
        page.parent_id = parent_id

    if status is not None:
        page.status = status

    if position is not None:
        page.position = position

    page.updated_by_id = user.id

    db.add(page)
    db.flush()

    return page


def autosave_page(
    db: Session,
    page: Page,
    *,
    title: str | None = None,
    content_markdown: str | None = None,
    user: User,
) -> Page:
    if title is not None:
        page.title = title

    if content_markdown is not None:
        page.content_markdown = content_markdown

    page.updated_by_id = user.id

    db.add(page)
    db.commit()
    db.refresh(page)

    return page


def archive_page(
    db: Session,
    page: Page,
    *,
    user: User,
) -> Page:
    page.status = "archived"
    page.archived_at = datetime.now(timezone.utc)
    page.updated_by_id = user.id

    db.add(page)
    db.flush()

    return page


def restore_archived_page(
    db: Session,
    page: Page,
    *,
    user: User,
) -> Page:
    page.status = "draft"
    page.archived_at = None
    page.updated_by_id = user.id

    db.add(page)
    db.flush()

    return page


def delete_page(db: Session, page: Page) -> None:
    db.delete(page)
    db.commit()


def search_workspace_pages(
    db: Session,
    *,
    workspace_id: int,
    query: str,
    include_archived: bool = False,
    limit: int = 20,
    offset: int = 0,
) -> list[Page]:
    search_pattern = f"%{query.strip()}%"

    statement = select(Page).where(
        Page.workspace_id == workspace_id,
        or_(
            Page.title.ilike(search_pattern),
            Page.content_markdown.ilike(search_pattern),
        ),
    )

    if not include_archived:
        statement = statement.where(Page.status != "archived")

    statement = (
        statement
        .order_by(Page.updated_at.desc())
        .limit(limit)
        .offset(offset)
    )

    return list(db.execute(statement).scalars().all())


def count_workspace_pages(
    db: Session,
    *,
    workspace_id: int,
    include_archived: bool = False,
) -> int:
    statement = select(func.count(Page.id)).where(
        Page.workspace_id == workspace_id,
    )

    if not include_archived:
        statement = statement.where(Page.status != "archived")

    return db.execute(statement).scalar_one()


def count_search_workspace_pages(
    db: Session,
    *,
    workspace_id: int,
    query: str,
    include_archived: bool = False,
) -> int:
    search_pattern = f"%{query.strip()}%"

    statement = select(func.count(Page.id)).where(
        Page.workspace_id == workspace_id,
        or_(
            Page.title.ilike(search_pattern),
            Page.content_markdown.ilike(search_pattern),
        ),
    )

    if not include_archived:
        statement = statement.where(Page.status != "archived")

    return db.execute(statement).scalar_one()