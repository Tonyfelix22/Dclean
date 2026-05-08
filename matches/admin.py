from django.contrib import admin
from .models import Match, MatchSnapshot, MatchTag


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ("user", "source", "url", "confidence_score", "risk_score", "status", "created_at")
    list_filter = ("status", "source", "is_visible")
    search_fields = ("user__email", "url")


@admin.register(MatchSnapshot)
class MatchSnapshotAdmin(admin.ModelAdmin):
    list_display = ("match", "is_still_live", "captured_at")


@admin.register(MatchTag)
class MatchTagAdmin(admin.ModelAdmin):
    list_display = ("match", "tag", "created_by")
