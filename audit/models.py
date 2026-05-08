"""Audit app models — AuditLog, SecurityEvent."""
from django.conf import settings
from django.db import models
from core.models import BaseModel


class AuditLog(BaseModel):
    """Records user and system actions for traceability."""

    class Action(models.TextChoices):
        LOGIN = "login", "Login"
        LOGOUT = "logout", "Logout"
        REGISTER = "register", "Register"
        CREATE = "create", "Create"
        READ = "read", "Read"
        UPDATE = "update", "Update"
        DELETE = "delete", "Delete"
        EXPORT = "export", "Export"
        VERIFY = "verify", "Verify"
        SCAN_START = "scan_start", "Scan Start"
        REMOVAL_SUBMIT = "removal_submit", "Removal Submitted"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=30, choices=Action.choices)
    resource = models.CharField(max_length=100, blank=True, help_text="Model/resource name.")
    resource_id = models.CharField(max_length=255, blank=True)
    changes = models.JSONField(default=dict, blank=True, help_text="Before/after snapshot.")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    extra = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "audit_logs"
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "action"]),
            models.Index(fields=["resource", "resource_id"]),
        ]

    def __str__(self):
        user_email = self.user.email if self.user else "Anonymous"
        return f"AuditLog({user_email}) — {self.action} on {self.resource}"


class SecurityEvent(BaseModel):
    """Records security-sensitive events such as failed logins or suspicious activity."""

    class Severity(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        CRITICAL = "critical", "Critical"

    class EventType(models.TextChoices):
        FAILED_LOGIN = "failed_login", "Failed Login"
        SUSPICIOUS_IP = "suspicious_ip", "Suspicious IP"
        TOKEN_REUSE = "token_reuse", "Token Reuse Attempt"
        BRUTE_FORCE = "brute_force", "Brute Force Detected"
        API_ABUSE = "api_abuse", "API Abuse"
        DATA_EXFIL = "data_exfil", "Data Exfiltration Attempt"

    event_type = models.CharField(max_length=30, choices=EventType.choices)
    severity = models.CharField(max_length=10, choices=Severity.choices, default=Severity.MEDIUM)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="security_events",
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    is_resolved = models.BooleanField(default=False)

    class Meta:
        db_table = "security_events"
        verbose_name = "Security Event"
        verbose_name_plural = "Security Events"
        ordering = ["-created_at"]

    def __str__(self):
        return f"SecurityEvent({self.event_type}) — {self.severity}"
