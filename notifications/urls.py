from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("", views.NotificationViewSet, basename="notification")

urlpatterns = [
    path("preferences/", views.NotificationPreferenceView.as_view(), name="notification-preferences"),
    path("", include(router.urls)),
]
