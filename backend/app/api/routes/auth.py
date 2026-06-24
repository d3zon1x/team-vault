from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from google.auth.exceptions import GoogleAuthError
from sqlalchemy.orm import Session

from app.api.api.dependencies import get_current_user, issue_token_pair
from app.core.security import create_access_token, hash_password, verify_password
from app.core.tokens import (
    generate_token,
    get_token_expiration,
    hash_token, )
from app.db.dependencies import get_db
from app.models.user import User
from app.repositories.refresh_token import (
    delete_all_refresh_tokens_for_user,
    delete_refresh_token,
    get_refresh_token_by_hash,
)
from app.repositories.user import (
    create_google_user,
    get_user_by_email,
    get_user_by_google_sub,
    link_google_account,
)
from app.repositories.user import create_user, get_user_by_verification_token_hash, \
    verify_user_email, update_user_password, get_user_by_password_reset_token_hash, set_password_reset_token
from app.repositories.user import set_verification_token
from app.schemas.auth import GoogleAuthRequest
from app.schemas.auth import LoginRequest, Token, MessageResponse, ResendVerificationRequest, ResetPasswordRequest, \
    ChangePasswordRequest, ForgotPasswordRequest, AccessTokenResponse, RefreshTokenRequest
from app.schemas.user import UserCreate, UserResponse
from app.services.google_auth import verify_google_id_token
from app.workers.email_tasks import (
    send_password_reset_email_task,
    send_verification_email_task,
)
from app.core.rate_limits import (
    AUTH_FORGOT_PASSWORD_LIMIT,
    AUTH_FORGOT_PASSWORD_WINDOW_SECONDS,
    AUTH_LOGIN_LIMIT,
    AUTH_LOGIN_WINDOW_SECONDS,
    AUTH_REGISTER_LIMIT,
    AUTH_REGISTER_WINDOW_SECONDS,
    AUTH_RESEND_VERIFICATION_LIMIT,
    AUTH_RESEND_VERIFICATION_WINDOW_SECONDS,
)
from app.services.rate_limit import check_rate_limit

router = APIRouter(prefix="/auth", tags=["Auth"])

security = HTTPBearer()


@router.post(
    "/register",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    check_rate_limit(
        key=f"rate_limit:auth:register:{payload.email.lower()}",
        limit=AUTH_REGISTER_LIMIT,
        window_seconds=AUTH_REGISTER_WINDOW_SECONDS,
    )

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

    send_verification_email_task.delay(
        user.email,
        verification_token,
    )
    return MessageResponse(message="Registration successful. Check your email.")


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    check_rate_limit(
        key=f"rate_limit:auth:login:{payload.email.lower()}",
        limit=AUTH_LOGIN_LIMIT,
        window_seconds=AUTH_LOGIN_WINDOW_SECONDS,
    )

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

    return issue_token_pair(db, user)


@router.post("/logout-all", response_model=MessageResponse)
def logout_all(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    delete_all_refresh_tokens_for_user(db, current_user.id)

    return MessageResponse(message="Logged out from all devices successfully")


@router.post("/logout", response_model=MessageResponse)
def logout(
    payload: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    token_hash = hash_token(payload.refresh_token)

    refresh_token = get_refresh_token_by_hash(db, token_hash)

    if refresh_token:
        delete_refresh_token(db, refresh_token)

    return MessageResponse(message="Logged out successfully")


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
    check_rate_limit(
        key=f"rate_limit:auth:resend_verification:{payload.email.lower()}",
        limit=AUTH_RESEND_VERIFICATION_LIMIT,
        window_seconds=AUTH_RESEND_VERIFICATION_WINDOW_SECONDS,
    )

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

    send_verification_email_task.delay(
        user.email,
        verification_token,
    )
    return MessageResponse(
        message="If this email exists, verification instructions were sent."
    )


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(
        payload: ForgotPasswordRequest,
        db: Session = Depends(get_db),
):
    check_rate_limit(
        key=f"rate_limit:auth:forgot_password:{payload.email.lower()}",
        limit=AUTH_FORGOT_PASSWORD_LIMIT,
        window_seconds=AUTH_FORGOT_PASSWORD_WINDOW_SECONDS,
    )

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

    send_password_reset_email_task.delay(
        user.email,
        reset_token,
    )

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

@router.post("/refresh", response_model=AccessTokenResponse)
def refresh_access_token(
    payload: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    token_hash = hash_token(payload.refresh_token)

    refresh_token = get_refresh_token_by_hash(db, token_hash)

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    if refresh_token.expires_at < datetime.now(timezone.utc):
        delete_refresh_token(db, refresh_token)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
        )

    access_token = create_access_token(subject=refresh_token.user_id)

    return AccessTokenResponse(access_token=access_token)

@router.post("/google", response_model=Token)
def google_auth(
    payload: GoogleAuthRequest,
    db: Session = Depends(get_db),
):
    try:
        google_payload = verify_google_id_token(payload.id_token)
    except (ValueError, GoogleAuthError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )

    google_sub = google_payload.get("sub")
    email = google_payload.get("email")
    email_verified = google_payload.get("email_verified", False)

    if not google_sub or not email or not email_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google account email is not verified",
        )

    user = get_user_by_google_sub(db, google_sub)

    if user:
        return issue_token_pair(db, user)

    existing_user = get_user_by_email(db, email)

    if existing_user:
        user = link_google_account(
            db,
            existing_user,
            google_sub=google_sub,
        )
        return issue_token_pair(db, user)

    username = email.split("@")[0]

    user = create_google_user(
        db,
        email=email,
        username=username,
        google_sub=google_sub,
    )

    return issue_token_pair(db, user)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
