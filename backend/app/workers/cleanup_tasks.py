from app.repositories.refresh_token import delete_expired_refresh_tokens
from app.repositories.user import (
    clear_expired_password_reset_tokens,
    clear_expired_verification_tokens,
)
from app.workers.celery_app import celery_app
from app.workers.db import get_worker_db


@celery_app.task(name="cleanup_expired_auth_tokens")
def cleanup_expired_auth_tokens_task() -> dict:
    db_generator = get_worker_db()
    db = next(db_generator)

    try:
        deleted_refresh_tokens = delete_expired_refresh_tokens(db)
        cleared_verification_tokens = clear_expired_verification_tokens(db)
        cleared_password_reset_tokens = clear_expired_password_reset_tokens(db)

        return {
            "deleted_refresh_tokens": deleted_refresh_tokens,
            "cleared_verification_tokens": cleared_verification_tokens,
            "cleared_password_reset_tokens": cleared_password_reset_tokens,
        }
    finally:
        db_generator.close()