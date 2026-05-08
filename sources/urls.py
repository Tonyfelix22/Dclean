"""Sources URL configuration."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("categories", views.SourceCategoryViewSet, basename="source-category")
router.register("removal-templates", views.SourceRemovalTemplateViewSet, basename="removal-template")
router.register("", views.SourceViewSet, basename="source")

urlpatterns = [path("", include(router.urls))]
