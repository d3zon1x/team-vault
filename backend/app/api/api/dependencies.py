from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token
from app.core.tokens import generate_token, hash_token, get_refresh_token_expiration
from app.db.dependencies import get_db
from app.models.user import User
from app.repositories.refresh_token import create_refresh_token
from app.repositories.user import get_user_by_id
from app.schemas.auth import Token

security = HTTPBearer()


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

def issue_token_pair(db: Session, user: User) -> Token:
    access_token = create_access_token(subject=user.id)
    refresh_token = generate_token()

    create_refresh_token(
        db,
        user=user,
        token_hash=hash_token(refresh_token),
        expires_at=get_refresh_token_expiration(days=30),
    )

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
    )