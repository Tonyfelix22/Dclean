"""Removals app models — RemovalRequest, RemovalAttempt, RemovalLog."""
from django.conf import settings
from django.db import models
from core.models import BaseModel


class RemovalRequest(BaseModel):
    """A request to remove personal data from a specific source."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        IN_PROGRESS = "in_progress", "In Progress"
        SUBMITTED = "submitted", "Submitted"
        CONFIRMED = "confirmed", "Confirmed"
        FAILED = "failed", "Failed"
        ESCALATED = "escalated", "Escalated"
        REJECTED = "rejected", "Rejected"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        NORMAL = "normal", "Normal"
        HIGH = "high", "High"
        URGENT = "urgent", "Urgent"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="removal_requests"
    )
    match = models.ForeignKey(
        "matches.Match", on_delete=models.CASCADE, related_name="removal_requests"
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.NORMAL)
    method = models.CharField(max_length=20, blank=True, help_text="Inherited from source removal template.")
    notes = models.TextField(blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_removals",
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "removal_requests"
        verbose_name = "Removal Request"
        verbose_name_plural = "Removal Requests"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Removal({self.user.email}) [{self.status}] → {self.match.url[:60]}"


class RemovalAttempt(BaseModel):
    """Records each individual attempt to submit a removal request."""

    request = models.ForeignKey(
        RemovalRequest, on_delete=models.CASCADE, related_name="attempts"
    )
    attempt_number = models.PositiveSmallIntegerField(default=1)
    method_used = models.CharField(max_length=20)
    submitted_at = models.DateTimeField(auto_now_add=True)
    response_code = models.PositiveSmallIntegerField(null=True, blank=True)
    response_body = models.TextField(blank=True)
    is_success = models.BooleanField(default=False)

    class Meta:
        db_table = "removal_attempts"
        verbose_name = "Removal Attempt"
        verbose_name_plural = "Removal Attempts"
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"Attempt #{self.attempt_number} for {self.request_id}"


class RemovalLog(BaseModel):
    """Audit trail of state changes and actions on a removal request."""

    class Action(models.TextChoices):
        CREATED = "created", "Created"
        STATUS_CHANGED = "status_changed", "Status Changed"
        NOTE_ADDED = "note_added", "Note Added"
        ESCALATED = "escalated", "Escalated"
        ATTEMPT_MADE = "attempt_made", "Attempt Made"
        CONFIRMED = "confirmed", "Confirmed"

    request = models.ForeignKey(
        RemovalRequest, on_delete=models.CASCADE, related_name="logs"
    )
    action = models.CharField(max_length=30, choices=Action.choices)
    message = models.TextField()
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        db_table = "removal_logs"
        verbose_name = "Removal Log"
        verbose_name_plural = "Removal Logs"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Log({self.action}) — Request {self.request_id}"
