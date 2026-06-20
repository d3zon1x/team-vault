import logging

logger = logging.getLogger(__name__)


def send_verification_email(email: str, token: str) -> None:
    verification_url = (
        f"http://localhost:5173/verify-email?token={token}"
    )

    logger.info(
        "Verification email for %s: %s",
        email,
        verification_url,
    )

def send_password_reset_email(email: str, token: str) -> None:
    reset_url = f"http://localhost:5173/reset-password?token={token}"

    logger.info(
        "Password reset link for %s: %s",
        email,
        reset_url,
    )