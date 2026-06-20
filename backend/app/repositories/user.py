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

def get_user_by_verification_token_hash(
    db: Session,
    token_hash: str,
) -> User | None:
    statement = select(User).where(User.verification_token_hash == token_hash)
    return db.execute(statement).scalar_one_or_none()


def verify_user_email(db: Session, user: User) -> User:
    user.is_verified = True
    user.verification_token_hash = None
    user.verification_token_expires_at = None

    db.commit()
    db.refresh(user)

    return user