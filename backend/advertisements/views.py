from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser
from .models import AdBanner
from .serializers import AdBannerSerializer, AdBannerPublicSerializer


class AdBannerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for ad banners.
    Public users can only view active banners.
    Admin users have full access.
    """
    queryset = AdBanner.objects.filter(is_active=True)
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        """Use public serializer for non-admin users"""
        if self.request.user and self.request.user.is_staff:
            return AdBannerSerializer
        return AdBannerPublicSerializer
    
    def get_queryset(self):
        """Filter banners by location if specified"""
        queryset = super().get_queryset()
        location = self.request.query_params.get('location', None)
        
        if location:
            # Filter banners that have this location in their locations list
            # Using Python filtering since SQLite doesn't support JSON contains
            all_banners = list(queryset)
            filtered_banners = [
                banner for banner in all_banners 
                if banner.locations and location in banner.locations
            ]
            # Return the filtered list as queryset
            banner_ids = [b.id for b in filtered_banners]
            queryset = queryset.filter(id__in=banner_ids)
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[])
    def track_impression(self, request, pk=None):
        """Track when a banner is displayed"""
        banner = self.get_object()
        banner.impressions += 1
        banner.save(update_fields=['impressions'])
        return Response({'status': 'impression tracked'})
    
    @action(detail=True, methods=['post'], permission_classes=[])
    def track_click(self, request, pk=None):
        """Track when a banner is clicked"""
        banner = self.get_object()
        banner.clicks += 1
        banner.save(update_fields=['clicks'])
        return Response({'status': 'click tracked'})
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def stats(self, request):
        """Get overall statistics for all banners"""
        all_banners = AdBanner.objects.all()
        
        total_impressions = sum(b.impressions for b in all_banners)
        total_clicks = sum(b.clicks for b in all_banners)
        avg_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
        
        return Response({
            'total_banners': all_banners.count(),
            'active_banners': all_banners.filter(is_active=True).count(),
            'total_impressions': total_impressions,
            'total_clicks': total_clicks,
            'average_ctr': round(avg_ctr, 2)
        })

