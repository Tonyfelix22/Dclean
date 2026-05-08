"""Scans app models — Scan, SearchIdentity, ScanTarget."""
from django.conf import settings
from django.db import models
from core.models import BaseModel


class SearchIdentity(BaseModel):
    """
    Attributes that define what personal data to search for.
    A user may have multiple identities (e.g., name variations).
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="search_identities"
    )
    label = models.CharField(max_length=100, default="Default", help_text="A friendly name for this identity.")
    full_name = models.CharField(max_length=255)
    aliases = models.JSONField(default=list, blank=True, help_text="List of name variations.")
    emails = models.JSONField(default=list, blank=True)
    phones = models.JSONField(default=list, blank=True)
    addresses = models.JSONField(default=list, blank=True)
    usernames = models.JSONField(default=list, blank=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        db_table = "search_identities"
        verbose_name = "Search Identity"
        verbose_name_plural = "Search Identities"

    def __str__(self):
        return f"{self.user.email} — {self.label} ({self.full_name})"


class Scan(BaseModel):
    """A scan job that orchestrates searches across multiple sources."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        RUNNING = "running", "Running"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"

    class ScanType(models.TextChoices):
        FULL = "full", "Full Scan"
        PARTIAL = "partial", "Partial Scan"
        MONITORING = "monitoring", "Monitoring Scan"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="scans"
    )
    identity = models.ForeignKey(
        SearchIdentity, on_delete=models.SET_NULL, null=True, related_name="scans"
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    scan_type = models.CharField(max_length=20, choices=ScanType.choices, default=ScanType.FULL)
    progress = models.PositiveSmallIntegerField(default=0, help_text="Completion percentage 0-100.")
    celery_task_id = models.CharField(max_length=255, blank=True)
    error_message = models.TextField(blank=True)
    sources_count = models.PositiveIntegerField(default=0)
    matches_count = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "scans"
        verbose_name = "Scan"
        verbose_name_plural = "Scans"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Scan({self.user.email}) — {self.status} [{self.progress}%]"


class ScanTarget(BaseModel):
    """Tracks scan progress for a single source within a scan job."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        RUNNING = "running", "Running"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        SKIPPED = "skipped", "Skipped"

    scan = models.ForeignKey(Scan, on_delete=models.CASCADE, related_name="targets")
    source = models.ForeignKey("sources.Source", on_delete=models.CASCADE, related_name="scan_targets")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    result_count = models.PositiveIntegerField(default=0)
    error_message = models.TextField(blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    raw_results = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = "scan_targets"
        verbose_name = "Scan Target"
        verbose_name_plural = "Scan Targets"
        unique_together = ("scan", "source")

    def __str__(self):
        return f"ScanTarget({self.scan_id}) → {self.source.name} [{self.status}]"
