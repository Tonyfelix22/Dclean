from django.contrib import admin
from .models import SourceCategory, Source, SourceRemovalTemplate


@admin.register(SourceCategory)
class SourceCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    list_display = ("name", "domain", "category", "risk_level", "is_active", "is_automated")
    list_filter = ("risk_level", "is_active", "is_automated", "category")
    search_fields = ("name", "domain")


@admin.register(SourceRemovalTemplate)
class SourceRemovalTemplateAdmin(admin.ModelAdmin):
    list_display = ("source", "method", "expected_turnaround_days")
    list_filter = ("method",)
