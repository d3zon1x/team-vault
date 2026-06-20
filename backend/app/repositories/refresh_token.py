from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.refresh_token import RefreshToken
from app.models.user import User


def create_refresh_token(
    db: Session,
    *,
    user: User,
    token_hash: str,
    expires_at: datetime,
) -> RefreshToken:
    refresh_token = RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )

    db.add(refresh_token)
    db.commit()
    db.refresh(refresh_token)

    return refresh_token


def get_refresh_token_by_hash(
    db: Session,
    token_hash: str,
) -> RefreshToken | None:
    statement = select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    return db.execute(statement).scalar_one_or_none()


def delete_refresh_token(
    db: Session,
    refresh_token: RefreshToken,
) -> None:
    db.delete(refresh_token)
    db.commit()