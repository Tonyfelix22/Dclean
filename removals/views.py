"""Removals app views."""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import RemovalRequest
from .serializers import RemovalRequestSerializer
from .tasks import submit_removal, escalate_removal


class RemovalRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "priority"]
    ordering_fields = ["created_at", "priority"]

    def get_queryset(self):
        return RemovalRequest.objects.filter(
            user=self.request.user
        ).select_related(
            "match__source"
        ).prefetch_related("attempts", "logs")

    def get_serializer_class(self):
        return RemovalRequestSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        removal = serializer.save()
        # Trigger async submission
        submit_removal.delay(str(removal.id))
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def escalate(self, request, pk=None):
        removal = self.get_object()
        if removal.status not in (RemovalRequest.Status.SUBMITTED, RemovalRequest.Status.FAILED):
            return Response(
                {"error": "Only submitted or failed requests can be escalated."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        escalate_removal.delay(str(removal.id))
        return Response({"success": True, "message": "Escalation triggered."})
