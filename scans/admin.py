from django.contrib import admin
from .models import SearchIdentity, Scan, ScanTarget


@admin.register(SearchIdentity)
class SearchIdentityAdmin(admin.ModelAdmin):
    list_display = ("user", "label", "full_name", "is_primary", "created_at")
    list_filter = ("is_primary",)
    search_fields = ("user__email", "full_name")


@admin.register(Scan)
class ScanAdmin(admin.ModelAdmin):
    list_display = ("user", "status", "scan_type", "progress", "sources_count", "matches_count", "created_at")
    list_filter = ("status", "scan_type")
    search_fields = ("user__email",)
    readonly_fields = ("celery_task_id", "started_at", "completed_at")


@admin.register(ScanTarget)
class ScanTargetAdmin(admin.ModelAdmin):
    list_display = ("scan", "source", "status", "result_count", "started_at")
    list_filter = ("status",)
