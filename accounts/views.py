"""Accounts app views."""
import uuid
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from .models import UserProfile, IdentityVerification, PasswordResetToken
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    IdentityVerificationSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """POST /api/v1/auth/register/ — Create a new user account."""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "success": True,
                "message": "Account created successfully.",
                "data": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": {
                        "id": str(user.id),
                        "email": user.email,
                        "full_name": user.full_name,
                        "role": user.role,
                    },
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """POST /api/v1/auth/login/ — Authenticate and receive JWT tokens."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "success": True,
                "data": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": {
                        "id": str(user.id),
                        "email": user.email,
                        "full_name": user.full_name,
                        "role": user.role,
                        "is_email_verified": user.is_email_verified,
                    },
                },
            }
        )


class LogoutView(APIView):
    """POST /api/v1/auth/logout/ — Blacklist the refresh token."""

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"success": True, "message": "Logged out successfully."})
        except Exception:
            return Response(
                {"success": False, "error": "Invalid token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/auth/profile/ — Retrieve or update the current user's profile."""

    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)


class UserProfileUpdateView(generics.UpdateAPIView):
    """PATCH /api/v1/auth/profile/details/ — Update extended profile."""

    serializer_class = UserProfileSerializer

    def get_object(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)


class ChangePasswordView(APIView):
    """POST /api/v1/auth/password/change/ — Change password for authenticated user."""

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response({"success": True, "message": "Password changed successfully."})


class PasswordResetRequestView(APIView):
    """POST /api/v1/auth/password/reset/ — Send a password reset email."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        try:
            user = User.objects.get(email=email)
            token_value = str(uuid.uuid4())
            PasswordResetToken.objects.create(
                user=user,
                token=token_value,
                expires_at=timezone.now() + timedelta(hours=2),
            )
            # TODO: send email with token
        except User.DoesNotExist:
            pass  # Silently fail to prevent user enumeration
        return Response(
            {"success": True, "message": "If that email exists, a reset link has been sent."}
        )


class PasswordResetConfirmView(APIView):
    """POST /api/v1/auth/password/reset/confirm/ — Set new password with token."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            reset_token = PasswordResetToken.objects.get(
                token=serializer.validated_data["token"],
                is_used=False,
                expires_at__gte=timezone.now(),
            )
            reset_token.user.set_password(serializer.validated_data["new_password"])
            reset_token.user.save()
            reset_token.is_used = True
            reset_token.save()
            return Response({"success": True, "message": "Password reset successfully."})
        except PasswordResetToken.DoesNotExist:
            return Response(
                {"success": False, "error": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class EmailVerificationView(APIView):
    """GET /api/v1/auth/verify-email/<token>/ — Verify email address."""

    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        try:
            user = User.objects.get(email_verification_token=token)
            user.is_email_verified = True
            user.email_verification_token = None
            user.save()
            return Response({"success": True, "message": "Email verified."})
        except User.DoesNotExist:
            return Response(
                {"success": False, "error": "Invalid verification token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class IdentityVerificationView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/auth/identity-verification/ — Submit or view identity docs."""

    serializer_class = IdentityVerificationSerializer

    def get_object(self):
        obj, _ = IdentityVerification.objects.get_or_create(user=self.request.user)
        return obj

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        if instance.status == "verified":
            return Response(
                {"success": False, "error": "Identity already verified."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        instance.status = "under_review"
        serializer.save(status="under_review")
        return Response({"success": True, "data": serializer.data})
