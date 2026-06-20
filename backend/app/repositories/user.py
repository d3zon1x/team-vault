from sqlalchemy import select
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.user import User


def get_user_by_email(db: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return db.execute(statement).scalar_one_or_none()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    statement = select(User).where(User.id == user_id)
    return db.execute(statement).scalar_one_or_none()


def create_user(
    db: Session,
    *,
    email: str,
    username: str,
    hashed_password: str,
) -> User:
    user = User(
        email=email,
        username=username,
        hashed_password=hashed_password,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def set_verification_token(
    db: Session,
    user: User,
    token_hash: str,
    expires_at: datetime,
) -> None:
    user.verification_token_hash = token_hash
    user.verification_token_expires_at = expires_at

    db.add(user)
    db.commit()