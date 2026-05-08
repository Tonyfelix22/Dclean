"""Accounts app models — User, UserProfile, IdentityVerification."""
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from core.models import BaseModel


class User(AbstractUser):
    """
    Custom User model using email as the primary identifier.
    Adds role-based access control and email verification status.
    """

    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        USER = "user", "User"
        STAFF = "staff", "Staff"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email


class UserProfile(BaseModel):
    """Extended profile information for a User."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    phone = models.CharField(max_length=30, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    bio = models.TextField(blank=True)

    class Meta:
        db_table = "user_profiles"
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"

    def __str__(self):
        return f"Profile of {self.user.email}"


class IdentityVerification(BaseModel):
    """Tracks identity verification status for a user."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        UNDER_REVIEW = "under_review", "Under Review"
        VERIFIED = "verified", "Verified"
        REJECTED = "rejected", "Rejected"

    class DocumentType(models.TextChoices):
        PASSPORT = "passport", "Passport"
        DRIVERS_LICENSE = "drivers_license", "Driver's License"
        NATIONAL_ID = "national_id", "National ID"
        OTHER = "other", "Other"

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="identity_verification"
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    document_type = models.CharField(
        max_length=30, choices=DocumentType.choices, blank=True
    )
    document_front = models.ImageField(
        upload_to="identity_docs/", null=True, blank=True
    )
    document_back = models.ImageField(
        upload_to="identity_docs/", null=True, blank=True
    )
    selfie = models.ImageField(upload_to="identity_docs/", null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_verifications",
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "identity_verifications"
        verbose_name = "Identity Verification"
        verbose_name_plural = "Identity Verifications"

    def __str__(self):
        return f"Verification({self.user.email}) — {self.status}"


class PasswordResetToken(BaseModel):
    """One-time token for password resets."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reset_tokens")
    token = models.CharField(max_length=255, unique=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        db_table = "password_reset_tokens"

    def __str__(self):
        return f"ResetToken({self.user.email})"
