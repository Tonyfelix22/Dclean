"""Sources app serializers."""
from rest_framework import serializers
from .models import SourceCategory, Source, SourceRemovalTemplate


class SourceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceCategory
        fields = ("id", "name", "slug", "description", "icon", "created_at")
        read_only_fields = ("id", "created_at")


class SourceRemovalTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceRemovalTemplate
        fields = (
            "id", "method", "contact_email", "form_url", "api_endpoint",
            "template_body", "instructions", "expected_turnaround_days",
        )
        read_only_fields = ("id",)


class SourceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    removal_template = SourceRemovalTemplateSerializer(read_only=True)

    class Meta:
        model = Source
        fields = (
            "id", "name", "domain", "url", "category", "category_name",
            "risk_level", "is_active", "is_automated", "logo_url",
            "description", "total_scans", "avg_removal_days",
            "removal_template", "created_at",
        )
        read_only_fields = ("id", "total_scans", "avg_removal_days", "created_at")
