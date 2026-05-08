"""Custom DRF permissions."""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsSelfOrAdmin(BasePermission):
    """Allow access to the object owner or admin users."""

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.user.role == "admin":
            return True
        return getattr(obj, "user", None) == request.user


class IsAdmin(BasePermission):
    """Allow access only to admin users."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "admin")


class IsVerifiedUser(BasePermission):
    """Allow access only to users who have verified their identity."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        try:
            return request.user.identity_verification.status == "verified"
        except Exception:
            return False


class IsOwnerOrReadOnly(BasePermission):
    """Allow read access to everyone; write access only to object owner."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return getattr(obj, "user", None) == request.user
