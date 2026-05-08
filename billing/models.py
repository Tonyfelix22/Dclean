"""Billing app models — Plan, Subscription, Invoice."""
from django.conf import settings
from django.db import models
from core.models import BaseModel


class Plan(BaseModel):
    """A subscription plan available to users."""

    class Interval(models.TextChoices):
        MONTHLY = "monthly", "Monthly"
        YEARLY = "yearly", "Yearly"

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    interval = models.CharField(max_length=10, choices=Interval.choices, default=Interval.MONTHLY)
    features = models.JSONField(default=list, blank=True)
    scan_limit = models.PositiveIntegerField(default=1, help_text="Max scans per period.")
    match_limit = models.PositiveIntegerField(default=50, help_text="Max tracked matches.")
    source_limit = models.PositiveIntegerField(default=10)
    max_removal_requests = models.PositiveIntegerField(default=10)
    is_active = models.BooleanField(default=True)
    stripe_price_id = models.CharField(max_length=255, blank=True)
    is_popular = models.BooleanField(default=False)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "billing_plans"
        verbose_name = "Plan"
        verbose_name_plural = "Plans"
        ordering = ["sort_order", "price"]

    def __str__(self):
        return f"{self.name} — ${self.price}/{self.interval}"


class Subscription(BaseModel):
    """A user's active or historical subscription to a plan."""

    class Status(models.TextChoices):
        TRIALING = "trialing", "Trialing"
        ACTIVE = "active", "Active"
        PAST_DUE = "past_due", "Past Due"
        CANCELLED = "cancelled", "Cancelled"
        EXPIRED = "expired", "Expired"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="subscriptions"
    )
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, related_name="subscriptions")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    started_at = models.DateTimeField()
    ends_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True)
    stripe_customer_id = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = "billing_subscriptions"
        verbose_name = "Subscription"
        verbose_name_plural = "Subscriptions"
        ordering = ["-started_at"]

    def __str__(self):
        return f"Subscription({self.user.email}) — {self.plan.name} [{self.status}]"

    @property
    def is_active(self):
        return self.status in (self.Status.ACTIVE, self.Status.TRIALING)


class Invoice(BaseModel):
    """A billing invoice associated with a subscription."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        OPEN = "open", "Open"
        PAID = "paid", "Paid"
        VOID = "void", "Void"
        UNCOLLECTIBLE = "uncollectible", "Uncollectible"

    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name="invoices")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="USD")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    paid_at = models.DateTimeField(null=True, blank=True)
    invoice_url = models.URLField(blank=True)
    stripe_invoice_id = models.CharField(max_length=255, blank=True, unique=True, null=True)
    period_start = models.DateField(null=True, blank=True)
    period_end = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "billing_invoices"
        verbose_name = "Invoice"
        verbose_name_plural = "Invoices"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Invoice({self.subscription.user.email}) — ${self.amount} [{self.status}]"
