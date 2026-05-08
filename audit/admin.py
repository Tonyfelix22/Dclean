from django.contrib import admin
from .models import AuditLog, SecurityEvent


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("user", "action", "resource", "ip_address", "created_at")
    list_filter = ("action",)
    search_fields = ("user__email", "resource", "ip_address")
    readonly_fields = ("created_at", "updated_at")


@admin.register(SecurityEvent)
class SecurityEventAdmin(admin.ModelAdmin):
    list_display = ("event_type", "severity", "user", "ip_address", "is_resolved", "created_at")
    list_filter = ("event_type", "severity", "is_resolved")
