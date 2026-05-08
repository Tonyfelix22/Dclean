"""Notifications app serializers."""
from rest_framework import serializers
from .models import Notification, NotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = (
            "id", "notification_type", "title", "body",
            "action_url", "is_read", "read_at", "created_at",
        )
        read_only_fields = ("id", "notification_type", "title", "body", "action_url", "read_at", "created_at")


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = (
            "id", "email_enabled", "in_app_enabled",
            "scan_alerts", "removal_updates", "new_match_alerts",
            "reappearance_alerts", "weekly_digest",
        )
        read_only_fields = ("id",)
