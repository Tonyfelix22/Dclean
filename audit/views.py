"""Audit app views."""
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from core.permissions import IsAdmin
from .models import AuditLog, SecurityEvent
from .serializers import AuditLogSerializer, SecurityEventSerializer


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["action", "resource", "user"]
    search_fields = ["resource", "ip_address"]
    ordering_fields = ["created_at"]

    def get_queryset(self):
        return AuditLog.objects.select_related("user").all()


class SecurityEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SecurityEventSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["event_type", "severity", "is_resolved"]
    ordering_fields = ["created_at"]

    def get_queryset(self):
        return SecurityEvent.objects.select_related("user").all()
