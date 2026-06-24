import redis
from fastapi import HTTPException, status

from app.core.config import settings


redis_client = redis.Redis.from_url(
    settings.redis_url,
    decode_responses=True,
)


def check_rate_limit(
    *,
    key: str,
    limit: int,
    window_seconds: int,
) -> None:
    current_count = redis_client.incr(key)

    if current_count == 1:
        redis_client.expire(key, window_seconds)

    if current_count > limit:
        ttl = redis_client.ttl(key)

        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many requests. Try again in {ttl} seconds.",
        )