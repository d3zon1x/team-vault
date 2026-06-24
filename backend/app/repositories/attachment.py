from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.attachment import Attachment
from app.models.user import User


def create_attachment(
    db: Session,
    *,
    workspace_id: int,
    page_id: int,
    uploaded_by: User,
    original_filename: str,
    stored_filename: str,
    s3_key: str,
    content_type: str,
    size_bytes: int,
) -> Attachment:
    attachment = Attachment(
        workspace_id=workspace_id,
        page_id=page_id,
        uploaded_by_id=uploaded_by.id,
        original_filename=original_filename,
        stored_filename=stored_filename,
        s3_key=s3_key,
        content_type=content_type,
        size_bytes=size_bytes,
    )

    db.add(attachment)
    db.flush()

    return attachment


def get_attachment_by_id(
    db: Session,
    attachment_id: int,
) -> Attachment | None:
    statement = select(Attachment).where(Attachment.id == attachment_id)
    return db.execute(statement).scalar_one_or_none()


def get_page_attachments(
    db: Session,
    page_id: int,
) -> list[Attachment]:
    statement = (
        select(Attachment)
        .where(Attachment.page_id == page_id)
        .order_by(Attachment.created_at.desc())
    )

    return list(db.execute(statement).scalars().all())


def delete_attachment(
    db: Session,
    attachment: Attachment,
) -> None:
    db.delete(attachment)
    db.flush()