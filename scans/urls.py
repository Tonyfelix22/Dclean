from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("identities", views.SearchIdentityViewSet, basename="search-identity")
router.register("targets", views.ScanTargetViewSet, basename="scan-target")
router.register("", views.ScanViewSet, basename="scan")

urlpatterns = [path("", include(router.urls))]
