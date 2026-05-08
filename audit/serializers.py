"""Audit app serializers and views."""
from rest_framework import serializers, viewsets, permissions, filters
from .models import AuditLog, SecurityEvent
from core.permissions import IsAdmin


class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = AuditLog
        fields = (
            "id", "user", "user_email", "action", "resource",
            "resource_id", "changes", "ip_address", "user_agent",
            "extra", "created_at",
        )


class SecurityEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityEvent
        fields = (
            "id", "event_type", "severity", "user", "ip_address",
            "description", "metadata", "is_resolved", "created_at",
        )
