"""Monitoring views."""
from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from .models import MonitoringPlan, MonitoringEvent
from .serializers import MonitoringPlanSerializer, MonitoringEventSerializer


class MonitoringPlanView(generics.RetrieveUpdateAPIView):
    serializer_class = MonitoringPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        plan, _ = MonitoringPlan.objects.get_or_create(user=self.request.user)
        return plan

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)


class MonitoringEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MonitoringEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MonitoringEvent.objects.filter(plan__user=self.request.user)

    def partial_update(self, request, pk=None):
        """PATCH to acknowledge an event."""
        event = self.get_object()
        event.is_acknowledged = True
        event.save(update_fields=["is_acknowledged"])
        return Response(MonitoringEventSerializer(event).data)
