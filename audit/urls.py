from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("logs", views.AuditLogViewSet, basename="audit-log")
router.register("security-events", views.SecurityEventViewSet, basename="security-event")

urlpatterns = [path("", include(router.urls))]
