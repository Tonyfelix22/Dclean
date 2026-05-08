from django.contrib import admin
from .models import RemovalRequest, RemovalAttempt, RemovalLog


@admin.register(RemovalRequest)
class RemovalRequestAdmin(admin.ModelAdmin):
    list_display = ("user", "status", "priority", "method", "submitted_at", "created_at")
    list_filter = ("status", "priority", "method")
    search_fields = ("user__email", "match__url")


@admin.register(RemovalAttempt)
class RemovalAttemptAdmin(admin.ModelAdmin):
    list_display = ("request", "attempt_number", "method_used", "is_success", "submitted_at")
    list_filter = ("is_success", "method_used")


@admin.register(RemovalLog)
class RemovalLogAdmin(admin.ModelAdmin):
    list_display = ("request", "action", "performed_by", "created_at")
    list_filter = ("action",)
