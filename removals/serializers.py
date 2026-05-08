"""Removals app serializers."""
from rest_framework import serializers
from .models import RemovalRequest, RemovalAttempt, RemovalLog


class RemovalLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = RemovalLog
        fields = ("id", "action", "message", "performed_by", "created_at")
        read_only_fields = ("id", "created_at")


class RemovalAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = RemovalAttempt
        fields = (
            "id", "attempt_number", "method_used", "submitted_at",
            "response_code", "response_body", "is_success",
        )
        read_only_fields = ("id", "submitted_at")


class RemovalRequestSerializer(serializers.ModelSerializer):
    attempts = RemovalAttemptSerializer(many=True, read_only=True)
    logs = RemovalLogSerializer(many=True, read_only=True)
    match_url = serializers.CharField(source="match.url", read_only=True)
    source_name = serializers.CharField(source="match.source.name", read_only=True)

    class Meta:
        model = RemovalRequest
        fields = (
            "id", "match", "match_url", "source_name",
            "status", "priority", "method", "notes",
            "submitted_at", "confirmed_at",
            "attempts", "logs", "created_at",
        )
        read_only_fields = (
            "id", "status", "method", "submitted_at", "confirmed_at", "created_at"
        )

    def create(self, validated_data):
        user = self.context["request"].user
        match = validated_data["match"]
        # Inherit method from the source's removal template
        try:
            validated_data["method"] = match.source.removal_template.method
        except Exception:
            validated_data["method"] = "manual"
        validated_data["user"] = user
        return super().create(validated_data)
