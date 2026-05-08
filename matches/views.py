"""Matches app views."""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import Match, MatchSnapshot, MatchTag
from .serializers import MatchSerializer, MatchSnapshotSerializer, MatchTagSerializer, MatchStatusUpdateSerializer


class MatchViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "source", "is_visible"]
    search_fields = ["url", "page_title"]
    ordering_fields = ["risk_score", "confidence_score", "created_at"]

    def get_queryset(self):
        return Match.objects.filter(
            user=self.request.user
        ).select_related("source").prefetch_related("tags")

    def get_serializer_class(self):
        if self.action == "update_status":
            return MatchStatusUpdateSerializer
        return MatchSerializer

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        match = self.get_object()
        serializer = MatchStatusUpdateSerializer(match, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(MatchSerializer(match).data)

    @action(detail=True, methods=["get"])
    def snapshots(self, request, pk=None):
        match = self.get_object()
        snapshots = MatchSnapshot.objects.filter(match=match)
        return Response(MatchSnapshotSerializer(snapshots, many=True).data)

    @action(detail=True, methods=["post"])
    def add_tag(self, request, pk=None):
        match = self.get_object()
        tag_value = request.data.get("tag", "").strip()
        if not tag_value:
            return Response({"error": "Tag cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)
        tag, _ = MatchTag.objects.get_or_create(
            match=match, tag=tag_value, defaults={"created_by": request.user}
        )
        return Response(MatchTagSerializer(tag).data, status=status.HTTP_201_CREATED)
