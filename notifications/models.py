"""Notifications app models — Notification, NotificationPreference."""
from django.conf import settings
from django.db import models
from core.models import BaseModel


class Notification(BaseModel):
    """An in-app notification sent to a user."""

    class NotificationType(models.TextChoices):
        SCAN_COMPLETE = "scan_complete", "Scan Complete"
        NEW_MATCH = "new_match", "New Match Found"
        REMOVAL_UPDATE = "removal_update", "Removal Update"
        REAPPEARANCE = "reappearance", "Data Reappeared"
        IDENTITY_VERIFIED = "identity_verified", "Identity Verified"
        SYSTEM = "system", "System"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices)
    title = models.CharField(max_length=255)
    body = models.TextField()
    action_url = models.CharField(max_length=500, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "notifications"
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Notification({self.user.email}) — {self.title}"


class NotificationPreference(BaseModel):
    """Per-user preferences for which notifications to receive and how."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notification_preference"
    )
    email_enabled = models.BooleanField(default=True)
    in_app_enabled = models.BooleanField(default=True)
    scan_alerts = models.BooleanField(default=True)
    removal_updates = models.BooleanField(default=True)
    new_match_alerts = models.BooleanField(default=True)
    reappearance_alerts = models.BooleanField(default=True)
    weekly_digest = models.BooleanField(default=True)

    class Meta:
        db_table = "notification_preferences"
        verbose_name = "Notification Preference"
        verbose_name_plural = "Notification Preferences"

    def __str__(self):
        return f"NotificationPrefs({self.user.email})"
