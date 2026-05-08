"""Scans app views."""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import SearchIdentity, Scan, ScanTarget
from .serializers import (
    SearchIdentitySerializer,
    ScanSerializer,
    ScanCreateSerializer,
    ScanTargetSerializer,
)
from .tasks import run_scan


class SearchIdentityViewSet(viewsets.ModelViewSet):
    serializer_class = SearchIdentitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SearchIdentity.objects.filter(user=self.request.user)


class ScanViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Scan.objects.filter(user=self.request.user).prefetch_related("targets__source")

    def get_serializer_class(self):
        if self.action == "create":
            return ScanCreateSerializer
        return ScanSerializer

    def create(self, request, *args, **kwargs):
        serializer = ScanCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        scan = serializer.save()
        # Kick off the celery task
        run_scan.delay(str(scan.id))
        return Response(ScanSerializer(scan).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        scan = self.get_object()
        if scan.status not in (Scan.Status.PENDING, Scan.Status.RUNNING):
            return Response(
                {"error": "Only pending or running scans can be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        scan.status = Scan.Status.CANCELLED
        scan.save(update_fields=["status"])
        return Response({"success": True, "status": scan.status})


class ScanTargetViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ScanTargetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ScanTarget.objects.filter(
            scan__user=self.request.user
        ).select_related("source")
