from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session


from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.db.dependencies import get_db
from app.models.user import User
from app.repositories.user import create_user, get_user_by_email, get_user_by_id, get_user_by_verification_token_hash, \
    verify_user_email
from app.schemas.auth import LoginRequest, Token, MessageResponse
from app.schemas.user import UserCreate, UserResponse
from app.core.tokens import (
    generate_token,
    get_token_expiration,
    hash_token,
)
from app.services.email import send_verification_email
from app.repositories.user import set_verification_token

router = APIRouter(prefix="/auth", tags=["Auth"])

security = HTTPBearer()


@router.post(
    "/register",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_email(db, payload.email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    user = create_user(
        db,
        email=payload.email,
        username=payload.username,
        hashed_password=hash_password(payload.password),
    )

    verification_token = generate_token()

    set_verification_token(
        db,
        user,
        hash_token(verification_token),
        get_token_expiration(hours=24),
    )

    send_verification_email(user.email, verification_token)

    return MessageResponse(message="Registration successful. Check your email.")


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, payload.email)

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Email is not verified",
        )

    access_token = create_access_token(subject=user.id)

    return Token(access_token=access_token)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        user_id = int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    user = get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user

@router.get("/verify-email", response_model=MessageResponse)
def verify_email(token: str, db: Session = Depends(get_db)):
    token_hash = hash_token(token)

    user = get_user_by_verification_token_hash(db, token_hash)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token",
        )

    if (
        user.verification_token_expires_at is None
        or user.verification_token_expires_at < datetime.now(timezone.utc)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token expired",
        )

    verify_user_email(db, user)

    return MessageResponse(message="Email verified successfully")


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user