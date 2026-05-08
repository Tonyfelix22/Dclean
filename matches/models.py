"""Matches app models — Match, MatchSnapshot, MatchTag."""
from django.conf import settings
from django.db import models
from core.models import BaseModel


class Match(BaseModel):
    """A discovered piece of personal data found at a specific URL."""

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        REMOVAL_PENDING = "removal_pending", "Removal Pending"
        REMOVED = "removed", "Removed"
        UNRESOLVABLE = "unresolvable", "Unresolvable"
        DISPUTED = "disputed", "Disputed"
        FALSE_POSITIVE = "false_positive", "False Positive"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="matches"
    )
    scan_target = models.ForeignKey(
        "scans.ScanTarget", on_delete=models.SET_NULL, null=True, blank=True, related_name="matches"
    )
    source = models.ForeignKey(
        "sources.Source", on_delete=models.CASCADE, related_name="matches"
    )
    url = models.URLField(max_length=2000)
    page_title = models.CharField(max_length=500, blank=True)
    # Scores  — 0.0–1.0
    confidence_score = models.FloatField(default=0.0)
    risk_score = models.FloatField(default=0.0)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.ACTIVE)
    # Extracted data snapshot
    raw_data = models.JSONField(default=dict, blank=True)
    data_fields = models.JSONField(
        default=list,
        blank=True,
        help_text="List of detected field names e.g. ['name', 'address', 'phone']",
    )
    is_visible = models.BooleanField(default=True)
    last_checked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "matches"
        verbose_name = "Match"
        verbose_name_plural = "Matches"
        ordering = ["-risk_score", "-created_at"]

    def __str__(self):
        return f"Match({self.user.email}) @ {self.url[:60]} [{self.status}]"


class MatchSnapshot(BaseModel):
    """A periodic snapshot of a match's data for tracking changes over time."""

    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="snapshots")
    snapshot_data = models.JSONField(default=dict)
    page_text = models.TextField(blank=True)
    is_still_live = models.BooleanField(default=True)
    captured_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "match_snapshots"
        verbose_name = "Match Snapshot"
        verbose_name_plural = "Match Snapshots"
        ordering = ["-captured_at"]

    def __str__(self):
        return f"Snapshot({self.match_id}) @ {self.captured_at:%Y-%m-%d}"


class MatchTag(BaseModel):
    """User-defined or system tags applied to a match."""

    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="tags")
    tag = models.CharField(max_length=50)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        db_table = "match_tags"
        verbose_name = "Match Tag"
        verbose_name_plural = "Match Tags"
        unique_together = ("match", "tag")

    def __str__(self):
        return f"Tag({self.tag}) → Match({self.match_id})"
