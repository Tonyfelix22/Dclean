from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("events", views.MonitoringEventViewSet, basename="monitoring-event")

urlpatterns = [
    path("plan/", views.MonitoringPlanView.as_view(), name="monitoring-plan"),
    path("", include(router.urls)),
]
