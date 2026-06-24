from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.page import Page
from app.models.page_version import PageVersion
from app.models.user import User


def get_next_version_number(db: Session, page_id: int) -> int:
    statement = select(func.max(PageVersion.version_number)).where(
        PageVersion.page_id == page_id
    )

    current_max = db.execute(statement).scalar_one_or_none()

    if current_max is None:
        return 1

    return current_max + 1


def create_page_version(
    db: Session,
    *,
    page: Page,
    user: User,
    change_message: str | None = None,
) -> PageVersion:
    version = PageVersion(
        page_id=page.id,
        version_number=get_next_version_number(db, page.id),
        title=page.title,
        content_markdown=page.content_markdown,
        status=page.status,
        change_message=change_message,
        created_by_id=user.id,
    )

    db.add(version)
    db.flush()

    return version


def get_page_versions(db: Session, page_id: int) -> list[PageVersion]:
    statement = (
        select(PageVersion)
        .where(PageVersion.page_id == page_id)
        .order_by(PageVersion.version_number.desc())
    )

    return list(db.execute(statement).scalars().all())


def get_page_version_by_id(
    db: Session,
    *,
    page_id: int,
    version_id: int,
) -> PageVersion | None:
    statement = select(PageVersion).where(
        PageVersion.page_id == page_id,
        PageVersion.id == version_id,
    )

    return db.execute(statement).scalar_one_or_none()