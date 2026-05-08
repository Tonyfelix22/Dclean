"""config URL Configuration"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from core.views import api_root_view
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    # Centralized Backend Root
    path("", api_root_view, name="backend-root"),
    path("api/v1/", api_root_view, name="api-root"),

    # Admin
    path("admin/", admin.site.urls),

    # API v1
    path("api/v1/auth/", include("accounts.urls")),
    path("api/v1/sources/", include("sources.urls")),
    path("api/v1/scans/", include("scans.urls")),
    path("api/v1/matches/", include("matches.urls")),
    path("api/v1/removals/", include("removals.urls")),
    path("api/v1/monitoring/", include("monitoring.urls")),
    path("api/v1/audit/", include("audit.urls")),
    path("api/v1/notifications/", include("notifications.urls")),
    path("api/v1/billing/", include("billing.urls")),

    # API Schema & Docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
