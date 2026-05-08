"""Notifications Celery tasks."""
from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
import logging

logger = logging.getLogger(__name__)


@shared_task
def send_email_notification(user_id: str, subject: str, body: str):
    """Send an email notification to a user."""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as exc:
        logger.exception(f"Failed to send email to user {user_id}: {exc}")


@shared_task
def send_in_app_notification(
    user_id: str,
    notification_type: str,
    title: str,
    body: str,
    action_url: str = "",
    metadata: dict = None,
):
    """Create an in-app notification record for a user."""
    from .models import Notification
    try:
        Notification.objects.create(
            user_id=user_id,
            notification_type=notification_type,
            title=title,
            body=body,
            action_url=action_url,
            metadata=metadata or {},
        )
    except Exception as exc:
        logger.exception(f"Failed to create in-app notification for user {user_id}: {exc}")
