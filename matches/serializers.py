"""Matches app serializers."""
from rest_framework import serializers
from .models import Match, MatchSnapshot, MatchTag


class MatchTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchTag
        fields = ("id", "tag", "created_at")
        read_only_fields = ("id", "created_at")


class MatchSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchSnapshot
        fields = ("id", "snapshot_data", "is_still_live", "captured_at")
        read_only_fields = ("id", "captured_at")


class MatchSerializer(serializers.ModelSerializer):
    tags = MatchTagSerializer(many=True, read_only=True)
    source_name = serializers.CharField(source="source.name", read_only=True)
    source_domain = serializers.CharField(source="source.domain", read_only=True)

    class Meta:
        model = Match
        fields = (
            "id", "source", "source_name", "source_domain",
            "url", "page_title", "confidence_score", "risk_score",
            "status", "data_fields", "is_visible",
            "last_checked_at", "tags", "created_at",
        )
        read_only_fields = (
            "id", "confidence_score", "risk_score", "data_fields",
            "last_checked_at", "created_at",
        )


class MatchStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ("status",)
