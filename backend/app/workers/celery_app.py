from celery import Celery

from app.core.config import settings


celery_app = Celery(
    "teamvault",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=[
        "app.workers.email_tasks",
        "app.workers.cleanup_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,
    task_soft_time_limit=240,
)

celery_app.conf.beat_schedule = {
    "cleanup-expired-auth-tokens-every-hour": {
        "task": "cleanup_expired_auth_tokens",
        "schedule": 60 * 60,
    },
}