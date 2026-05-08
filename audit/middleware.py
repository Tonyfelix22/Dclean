"""Audit app middleware — auto-log key API requests."""
from django.utils.deprecation import MiddlewareMixin
import logging

logger = logging.getLogger(__name__)

# Only log mutating methods to avoid spamming reads
LOGGED_METHODS = {"POST", "PUT", "PATCH", "DELETE"}

# Skip admin and schema paths
SKIP_PATHS = ("/admin/", "/api/schema/", "/api/docs/", "/api/redoc/")


class AuditMiddleware(MiddlewareMixin):
    """
    Lightweight middleware that logs mutating API calls to AuditLog.
    Only runs when the user is authenticated.
    """

    def process_response(self, request, response):
        if request.method not in LOGGED_METHODS:
            return response
        if any(request.path.startswith(p) for p in SKIP_PATHS):
            return response
        if not hasattr(request, "user") or not request.user.is_authenticated:
            return response

        try:
            from .models import AuditLog

            method_action_map = {
                "POST": AuditLog.Action.CREATE,
                "PUT": AuditLog.Action.UPDATE,
                "PATCH": AuditLog.Action.UPDATE,
                "DELETE": AuditLog.Action.DELETE,
            }

            action = method_action_map.get(request.method, AuditLog.Action.CREATE)
            ip = self._get_client_ip(request)

            AuditLog.objects.create(
                user=request.user,
                action=action,
                resource=request.path,
                ip_address=ip,
                user_agent=request.META.get("HTTP_USER_AGENT", ""),
                extra={"status_code": response.status_code},
            )
        except Exception:
            # Never let audit logging break the response
            logger.exception("AuditMiddleware: failed to create AuditLog entry.")

        return response

    @staticmethod
    def _get_client_ip(request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")
