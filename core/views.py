from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from collections import OrderedDict

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root_view(request, format=None):
    """
    Centralized backend API Root.
    Provides health status and lists all major API endpoints.
    """
    return Response(OrderedDict({
        'status': 'online',
        'message': 'Welcome to the Dclean API',
        'endpoints': {
            'auth': request.build_absolute_uri('/api/v1/auth/'),
            'sources': request.build_absolute_uri('/api/v1/sources/'),
            'scans': request.build_absolute_uri('/api/v1/scans/'),
            'matches': request.build_absolute_uri('/api/v1/matches/'),
            'removals': request.build_absolute_uri('/api/v1/removals/'),
            'monitoring': request.build_absolute_uri('/api/v1/monitoring/'),
            'audit': request.build_absolute_uri('/api/v1/audit/'),
            'notifications': request.build_absolute_uri('/api/v1/notifications/'),
            'billing': request.build_absolute_uri('/api/v1/billing/'),
            'admin': request.build_absolute_uri('/admin/'),
            'schema': request.build_absolute_uri('/api/schema/'),
            'swagger-docs': request.build_absolute_uri('/api/docs/'),
            'redoc': request.build_absolute_uri('/api/redoc/'),
        }
    }))
