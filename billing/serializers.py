"""Billing app serializers."""
from rest_framework import serializers
from .models import Plan, Subscription, Invoice


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = (
            "id", "name", "slug", "description", "price", "interval",
            "features", "scan_limit", "match_limit", "source_limit",
            "max_removal_requests", "is_active", "is_popular", "sort_order",
        )
        read_only_fields = ("id",)


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = (
            "id", "amount", "currency", "status", "paid_at",
            "invoice_url", "period_start", "period_end", "created_at",
        )
        read_only_fields = ("id", "created_at")


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)
    plan_id = serializers.UUIDField(write_only=True)
    invoices = InvoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Subscription
        fields = (
            "id", "plan", "plan_id", "status", "started_at",
            "ends_at", "cancelled_at", "invoices", "created_at",
        )
        read_only_fields = (
            "id", "status", "started_at", "ends_at", "cancelled_at", "created_at"
        )

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
