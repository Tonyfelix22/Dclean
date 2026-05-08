from django.contrib import admin
from .models import Plan, Subscription, Invoice


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "interval", "is_active", "is_popular", "sort_order")
    list_filter = ("interval", "is_active")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("user", "plan", "status", "started_at", "ends_at")
    list_filter = ("status", "plan")
    search_fields = ("user__email",)


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("subscription", "amount", "currency", "status", "paid_at", "created_at")
    list_filter = ("status", "currency")
