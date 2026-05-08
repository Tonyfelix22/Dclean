"""Accounts admin registration."""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, UserProfile, IdentityVerification, PasswordResetToken


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "full_name", "role", "is_email_verified", "is_active", "created_at")
    list_filter = ("role", "is_email_verified", "is_active", "is_staff")
    search_fields = ("email", "username", "first_name", "last_name")
    ordering = ("-created_at",)
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Dclean", {"fields": ("role", "is_email_verified", "email_verification_token")}),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "city", "country", "created_at")
    search_fields = ("user__email", "phone")


@admin.register(IdentityVerification)
class IdentityVerificationAdmin(admin.ModelAdmin):
    list_display = ("user", "status", "document_type", "verified_at", "created_at")
    list_filter = ("status", "document_type")
    search_fields = ("user__email",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "is_used", "expires_at", "created_at")
    list_filter = ("is_used",)
