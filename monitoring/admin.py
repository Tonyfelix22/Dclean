from django.contrib import admin
from .models import MonitoringPlan, MonitoringEvent


@admin.register(MonitoringPlan)
class MonitoringPlanAdmin(admin.ModelAdmin):
    list_display = ("user", "interval", "is_active", "last_run_at", "next_run_at")
    list_filter = ("interval", "is_active")


@admin.register(MonitoringEvent)
class MonitoringEventAdmin(admin.ModelAdmin):
    list_display = ("plan", "event_type", "is_acknowledged", "detected_at")
    list_filter = ("event_type", "is_acknowledged")
