"""Accounts URL configuration."""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    # Registration & Auth
    path("register/", views.RegisterView.as_view(), name="auth-register"),
    path("login/", views.LoginView.as_view(), name="auth-login"),
    path("logout/", views.LogoutView.as_view(), name="auth-logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),

    # Profile
    path("profile/", views.ProfileView.as_view(), name="auth-profile"),
    path("profile/details/", views.UserProfileUpdateView.as_view(), name="auth-profile-details"),

    # Password
    path("password/change/", views.ChangePasswordView.as_view(), name="auth-password-change"),
    path("password/reset/", views.PasswordResetRequestView.as_view(), name="auth-password-reset"),
    path("password/reset/confirm/", views.PasswordResetConfirmView.as_view(), name="auth-password-reset-confirm"),

    # Email & Identity
    path("verify-email/<str:token>/", views.EmailVerificationView.as_view(), name="auth-verify-email"),
    path("identity-verification/", views.IdentityVerificationView.as_view(), name="auth-identity-verification"),
]
