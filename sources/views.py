"""Sources app views."""
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend

from core.permissions import IsAdmin
from .models import SourceCategory, Source, SourceRemovalTemplate
from .serializers import SourceCategorySerializer, SourceSerializer, SourceRemovalTemplateSerializer


class SourceCategoryViewSet(viewsets.ModelViewSet):
    queryset = SourceCategory.objects.all()
    serializer_class = SourceCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "slug"]
    ordering_fields = ["name", "created_at"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]


class SourceViewSet(viewsets.ModelViewSet):
    queryset = Source.objects.select_related("category", "removal_template").filter(is_active=True)
    serializer_class = SourceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "risk_level", "is_active", "is_automated"]
    search_fields = ["name", "domain"]
    ordering_fields = ["name", "risk_level", "created_at"]

    def get_queryset(self):
        qs = Source.objects.select_related("category", "removal_template")
        if not self.request.user.is_staff and self.request.user.role != "admin":
            qs = qs.filter(is_active=True)
        return qs

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]


class SourceRemovalTemplateViewSet(viewsets.ModelViewSet):
    queryset = SourceRemovalTemplate.objects.select_related("source")
    serializer_class = SourceRemovalTemplateSerializer
    permission_classes = [IsAdmin]
