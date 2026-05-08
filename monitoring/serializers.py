"""Monitoring app serializers, views, urls, admin, tasks, apps."""
from rest_framework import serializers
from .models import MonitoringPlan, MonitoringEvent


class MonitoringPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonitoringPlan
        fields = (
            "id", "is_active", "interval",
            "notify_on_new_match", "notify_on_reappearance",
            "last_run_at", "next_run_at", "created_at",
        )
        read_only_fields = ("id", "last_run_at", "next_run_at", "created_at")


class MonitoringEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonitoringEvent
        fields = (
            "id", "plan", "scan", "match", "event_type",
            "description", "is_acknowledged", "detected_at",
        )
        read_only_fields = ("id", "plan", "scan", "match", "event_type", "description", "detected_at")
