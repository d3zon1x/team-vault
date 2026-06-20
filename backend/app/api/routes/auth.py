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
    verify_user_email, update_user_password, get_user_by_password_reset_token_hash
from app.schemas.auth import LoginRequest, Token, MessageResponse, ResendVerificationRequest, ResetPasswordRequest, \
    ChangePasswordRequest
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


@router.post("/resend-verification", response_model=MessageResponse)
def resend_verification(
    payload: ResendVerificationRequest,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(db, payload.email)

    if not user:
        return MessageResponse(
            message="If this email exists, verification instructions were sent."
        )

    if user.is_verified:
        return MessageResponse(message="Email is already verified.")

    verification_token = generate_token()

    set_verification_token(
        db,
        user,
        hash_token(verification_token),
        get_token_expiration(hours=24),
    )

    send_verification_email(user.email, verification_token)

    return MessageResponse(
        message="If this email exists, verification instructions were sent."
    )

@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(db, payload.email)

    if not user:
        return MessageResponse(
            message="If this email exists, password reset instructions were sent."
        )

    reset_token = generate_token()

    set_password_reset_token(
        db,
        user,
        hash_token(reset_token),
        get_token_expiration(hours=1),
    )

    send_password_reset_email(user.email, reset_token)

    return MessageResponse(
        message="If this email exists, password reset instructions were sent."
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    token_hash = hash_token(payload.token)

    user = get_user_by_password_reset_token_hash(db, token_hash)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password reset token",
        )

    if (
        user.password_reset_expires_at is None
        or user.password_reset_expires_at < datetime.now(timezone.utc)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token expired",
        )

    update_user_password(
        db,
        user,
        hash_password(payload.new_password),
    )

    return MessageResponse(message="Password has been reset successfully")

@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password change is not available for this account",
        )

    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    update_user_password(
        db,
        current_user,
        hash_password(payload.new_password),
    )

    return MessageResponse(message="Password changed successfully")

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user