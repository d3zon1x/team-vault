from app.services.email import (
    send_password_reset_email,
    send_verification_email,
)
from app.workers.celery_app import celery_app


@celery_app.task(name="send_verification_email")
def send_verification_email_task(email: str, token: str) -> None:
    send_verification_email(email=email, token=token)


@celery_app.task(name="send_password_reset_email")
def send_password_reset_email_task(email: str, token: str) -> None:
    send_password_reset_email(email=email, token=token)


