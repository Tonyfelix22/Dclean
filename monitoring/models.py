"""Monitoring app models — MonitoringPlan, MonitoringEvent."""
from django.conf import settings
from django.db import models
from core.models import BaseModel


class MonitoringPlan(BaseModel):
    """Defines how frequently a user's data should be rescanned."""

    class Interval(models.TextChoices):
        DAILY = "daily", "Daily"
        WEEKLY = "weekly", "Weekly"
        MONTHLY = "monthly", "Monthly"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="monitoring_plan"
    )
    is_active = models.BooleanField(default=True)
    interval = models.CharField(max_length=10, choices=Interval.choices, default=Interval.WEEKLY)
    notify_on_new_match = models.BooleanField(default=True)
    notify_on_reappearance = models.BooleanField(default=True)
    last_run_at = models.DateTimeField(null=True, blank=True)
    next_run_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "monitoring_plans"
        verbose_name = "Monitoring Plan"
        verbose_name_plural = "Monitoring Plans"

    def __str__(self):
        return f"MonitoringPlan({self.user.email}) — {self.interval}"


class MonitoringEvent(BaseModel):
    """Records a meaningful event detected during a monitoring scan."""

    class EventType(models.TextChoices):
        NEW_MATCH = "new_match", "New Match"
        REAPPEARANCE = "reappearance", "Data Reappeared"
        REMOVAL_CONFIRMED = "removal_confirmed", "Removal Confirmed"
        SCORE_CHANGE = "score_change", "Risk Score Changed"

    plan = models.ForeignKey(MonitoringPlan, on_delete=models.CASCADE, related_name="events")
    scan = models.ForeignKey(
        "scans.Scan", on_delete=models.SET_NULL, null=True, blank=True, related_name="monitoring_events"
    )
    match = models.ForeignKey(
        "matches.Match", on_delete=models.SET_NULL, null=True, blank=True, related_name="monitoring_events"
    )
    event_type = models.CharField(max_length=30, choices=EventType.choices)
    description = models.TextField(blank=True)
    is_acknowledged = models.BooleanField(default=False)
    detected_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "monitoring_events"
        verbose_name = "Monitoring Event"
        verbose_name_plural = "Monitoring Events"
        ordering = ["-detected_at"]

    def __str__(self):
        return f"MonitoringEvent({self.event_type}) — {self.plan.user.email}"
