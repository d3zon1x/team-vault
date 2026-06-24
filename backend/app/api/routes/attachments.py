from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.api.dependencies import get_current_user
from app.core.audit_actions import ATTACHMENT_UPLOADED, ATTACHMENT_DELETED
from app.db.dependencies import get_db
from app.models.user import User
from app.repositories.attachment import (
    create_attachment,
    delete_attachment,
    get_attachment_by_id,
    get_page_attachments,
)
from app.repositories.audit_log import create_audit_log
from app.schemas.attachment import (
    AttachmentDownloadUrlResponse,
    AttachmentResponse,
)
from app.schemas.auth import MessageResponse
from app.services.pages import (
    get_page_or_404,
    require_page_read_access,
    require_page_write_access,
)
from app.services.storage import (
    build_attachment_s3_key,
    delete_file_from_s3,
    generate_download_url,
    upload_file_to_s3,
    validate_and_read_upload_file,
)

router = APIRouter(tags=["Attachments"])


@router.post(
    "/pages/{page_id}/attachments",
    response_model=AttachmentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_page_attachment(
    page_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    page = get_page_or_404(db, page_id)

    require_page_write_access(
        db,
        page=page,
        user=current_user,
    )

    content = await validate_and_read_upload_file(file)

    s3_key, stored_filename = build_attachment_s3_key(
        workspace_id=page.workspace_id,
        page_id=page.id,
        filename=file.filename or "attachment",
    )

    upload_file_to_s3(
        s3_key=s3_key,
        content=content,
        content_type=file.content_type or "application/octet-stream",
    )

    attachment = create_attachment(
        db,
        workspace_id=page.workspace_id,
        page_id=page.id,
        uploaded_by=current_user,
        original_filename=file.filename or "attachment",
        stored_filename=stored_filename,
        s3_key=s3_key,
        content_type=file.content_type or "application/octet-stream",
        size_bytes=len(content),
    )

    create_audit_log(
        db,
        workspace_id=page.workspace_id,
        actor=current_user,
        action=ATTACHMENT_UPLOADED,
        entity_type="attachment",
        entity_id=attachment.id,
        description=f"Uploaded attachment '{attachment.original_filename}'",
        metadata={
            "page_id": page.id,
            "filename": attachment.original_filename,
            "content_type": attachment.content_type,
            "size_bytes": attachment.size_bytes,
        },
    )

    db.commit()
    db.refresh(attachment)

    return attachment


@router.get(
    "/pages/{page_id}/attachments",
    response_model=list[AttachmentResponse],
)
def list_page_attachments(
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

    return get_page_attachments(db, page_id)


@router.get(
    "/attachments/{attachment_id}",
    response_model=AttachmentResponse,
)
def get_attachment_endpoint(
    attachment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attachment = get_attachment_by_id(db, attachment_id)

    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found",
        )

    page = get_page_or_404(db, attachment.page_id)

    require_page_read_access(
        db,
        page=page,
        user=current_user,
    )

    return attachment


@router.get(
    "/attachments/{attachment_id}/download-url",
    response_model=AttachmentDownloadUrlResponse,
)
def get_attachment_download_url(
    attachment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attachment = get_attachment_by_id(db, attachment_id)

    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found",
        )

    page = get_page_or_404(db, attachment.page_id)

    require_page_read_access(
        db,
        page=page,
        user=current_user,
    )

    expires_in = 3600

    return AttachmentDownloadUrlResponse(
        url=generate_download_url(
            s3_key=attachment.s3_key,
            expires_in=expires_in,
        ),
        expires_in=expires_in,
    )


@router.delete(
    "/attachments/{attachment_id}",
    response_model=MessageResponse,
)
def delete_attachment_endpoint(
    attachment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    attachment = get_attachment_by_id(db, attachment_id)

    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found",
        )

    page = get_page_or_404(db, attachment.page_id)

    require_page_write_access(
        db,
        page=page,
        user=current_user,
    )

    create_audit_log(
        db,
        workspace_id=attachment.workspace_id,
        actor=current_user,
        action=ATTACHMENT_DELETED,
        entity_type="attachment",
        entity_id=attachment.id,
        description=f"Deleted attachment '{attachment.original_filename}'",
        metadata={
            "page_id": attachment.page_id,
            "filename": attachment.original_filename,
            "content_type": attachment.content_type,
            "size_bytes": attachment.size_bytes,
        },
    )

    db.commit()

    delete_file_from_s3(s3_key=attachment.s3_key)
    delete_attachment(db, attachment)

    return MessageResponse(message="Attachment deleted successfully")