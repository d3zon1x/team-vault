import hashlib
import secrets
from datetime import datetime, timedelta, timezone


def generate_token() -> str:
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def get_token_expiration(hours: int = 24) -> datetime:
    return datetime.now(timezone.utc) + timedelta(hours=hours)