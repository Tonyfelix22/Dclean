"""Scans app serializers."""
from rest_framework import serializers
from .models import SearchIdentity, Scan, ScanTarget


class SearchIdentitySerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchIdentity
        fields = (
            "id", "label", "full_name", "aliases", "emails",
            "phones", "addresses", "usernames", "is_primary", "created_at",
        )
        read_only_fields = ("id", "created_at")

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class ScanTargetSerializer(serializers.ModelSerializer):
    source_name = serializers.CharField(source="source.name", read_only=True)
    source_domain = serializers.CharField(source="source.domain", read_only=True)

    class Meta:
        model = ScanTarget
        fields = (
            "id", "source", "source_name", "source_domain",
            "status", "result_count", "error_message",
            "started_at", "completed_at",
        )
        read_only_fields = ("id", "status", "result_count", "error_message", "started_at", "completed_at")


class ScanSerializer(serializers.ModelSerializer):
    targets = ScanTargetSerializer(many=True, read_only=True)
    identity_label = serializers.CharField(source="identity.label", read_only=True)

    class Meta:
        model = Scan
        fields = (
            "id", "identity", "identity_label", "status", "scan_type",
            "progress", "sources_count", "matches_count",
            "started_at", "completed_at", "error_message",
            "targets", "created_at",
        )
        read_only_fields = (
            "id", "status", "progress", "sources_count", "matches_count",
            "started_at", "completed_at", "error_message", "created_at",
        )

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class ScanCreateSerializer(serializers.ModelSerializer):
    """Lightweight serializer for creating a new scan."""

    class Meta:
        model = Scan
        fields = ("identity", "scan_type")

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
