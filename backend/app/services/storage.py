import uuid
from io import BytesIO

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings


ALLOWED_ATTACHMENT_CONTENT_TYPES = {
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
    "application/zip",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
}

MAX_ATTACHMENT_SIZE_BYTES = 20 * 1024 * 1024


def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
        region_name=settings.s3_region_name,
        config=Config(signature_version="s3v4"),
    )


def ensure_bucket_exists() -> None:
    client = get_s3_client()

    try:
        client.head_bucket(Bucket=settings.s3_bucket_name)
    except ClientError:
        client.create_bucket(Bucket=settings.s3_bucket_name)


def build_attachment_s3_key(
    *,
    workspace_id: int,
    page_id: int,
    filename: str,
) -> tuple[str, str]:
    extension = ""

    if "." in filename:
        extension = "." + filename.rsplit(".", 1)[1].lower()

    stored_filename = f"{uuid.uuid4()}{extension}"

    s3_key = (
        f"workspaces/{workspace_id}/"
        f"pages/{page_id}/"
        f"attachments/{stored_filename}"
    )

    return s3_key, stored_filename


async def validate_and_read_upload_file(file: UploadFile) -> bytes:
    if file.content_type not in ALLOWED_ATTACHMENT_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type is not allowed",
        )

    content = await file.read()

    if len(content) > MAX_ATTACHMENT_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is too large",
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File cannot be empty",
        )

    return content


def upload_file_to_s3(
    *,
    s3_key: str,
    content: bytes,
    content_type: str,
) -> None:
    ensure_bucket_exists()

    client = get_s3_client()

    client.upload_fileobj(
        BytesIO(content),
        settings.s3_bucket_name,
        s3_key,
        ExtraArgs={
            "ContentType": content_type,
        },
    )


def delete_file_from_s3(*, s3_key: str) -> None:
    client = get_s3_client()

    client.delete_object(
        Bucket=settings.s3_bucket_name,
        Key=s3_key,
    )

def get_s3_public_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.s3_public_url,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
        region_name=settings.s3_region_name,
        config=Config(signature_version="s3v4"),
    )


def generate_download_url(
    *,
    s3_key: str,
    expires_in: int = 3600,
) -> str:
    client = get_s3_public_client()

    return client.generate_presigned_url(
        ClientMethod="get_object",
        Params={
            "Bucket": settings.s3_bucket_name,
            "Key": s3_key,
        },
        ExpiresIn=expires_in,
    )
